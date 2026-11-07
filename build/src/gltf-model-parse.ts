import { type AnimationClip, Group, LoadingManager, type Object3D, type WebGLRenderer } from 'three'
import type { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { type GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import {
  GLTF_BASISU_EXTENSION,
  GLTF_DRACO_EXTENSION,
  GLTF_MESHOPT_EXTENSIONS,
  type GltfDocument,
  type GltfModelData,
  gltfUsesExtension,
  isDataUri,
  isRecord
} from './gltf-document-inspection.ts'
import { disposeObjectTree, resourcesOf } from './model-disposal.ts'

export type GltfModel = {
  scene: Object3D
  animations: AnimationClip[]
  /** Scenes in the file beyond the one shown. */
  otherSceneCount: number
}

// Why: the frame cannot read files beside the model. Callers refuse external buffers first, so only
// external images get here, and a white pixel stands in for each without a load error.
export const BLOCKED_RESOURCE_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC'

// A parse that has not settled by then is treated as a failure, so a stalled decoder cannot leave
// the view on "Loading…" for good.
export const PARSE_TIMEOUT_MS = 60_000

/**
 * Lets through only in-memory URLs: `data:` URIs, and `blob:` URLs this viewer created during the
 * parse (GLTFLoader makes one per embedded image). Any URL the model names itself is blocked.
 */
export function resolveResourceUrl(url: string, ownBlobUrls: ReadonlySet<string> = new Set()): string {
  return isDataUri(url) || ownBlobUrls.has(url) ? url : BLOCKED_RESOURCE_URL
}

// Blob URLs created while a parse runs; GLTFLoader creates its image URLs within.
const ownBlobUrls = new Set<string>()
let activeParses = 0
let originalCreateObjectURL: typeof URL.createObjectURL | null = null

export function trackBlobUrls(): () => void {
  if (activeParses++ === 0) {
    const create = URL.createObjectURL.bind(URL)
    originalCreateObjectURL = URL.createObjectURL
    URL.createObjectURL = (object: Blob | MediaSource) => {
      const url = create(object)
      ownBlobUrls.add(url)
      return url
    }
  }
  return () => {
    if (--activeParses === 0 && originalCreateObjectURL) {
      URL.createObjectURL = originalCreateObjectURL
      originalCreateObjectURL = null
      ownBlobUrls.clear()
    }
  }
}

export const resolveOwnUrl = (url: string): string => resolveResourceUrl(url, ownBlobUrls)

// Why shared: each new loader re-fetches and compiles its decoder and starts its own workers.
let dracoLoader: Promise<DRACOLoader> | null = null
const ktx2Loaders = new Map<WebGLRenderer, Promise<KTX2Loader>>()
let meshoptReady: Promise<unknown> | null = null

function sharedDracoLoader(): Promise<DRACOLoader> {
  dracoLoader ??= import('./draco-decoder.ts').then(({ createDracoLoader }) => createDracoLoader())
  return dracoLoader
}

function sharedKtx2Loader(renderer: WebGLRenderer): Promise<KTX2Loader> {
  let loader = ktx2Loaders.get(renderer)
  if (!loader) {
    loader = import('./ktx2-decoder.ts').then(({ createKtx2Loader }) => createKtx2Loader(renderer, resolveOwnUrl))
    ktx2Loaders.set(renderer, loader)
  }
  return loader
}

async function meshoptDecoder(): Promise<typeof import('three/examples/jsm/libs/meshopt_decoder.module.js').MeshoptDecoder> {
  const { MeshoptDecoder } = await import('three/examples/jsm/libs/meshopt_decoder.module.js')
  // Why a worker: decoding then runs off the UI thread, and its heap is not the page's.
  meshoptReady ??= MeshoptDecoder.ready.then(() => MeshoptDecoder.useWorkers(1))
  await meshoptReady
  return MeshoptDecoder
}

/**
 * Terminates the decoder workers, so a parse that timed out stops decoding instead of running on
 * beside the next one; the next parse that needs a decoder starts a fresh one.
 */
export function stopDecoders(): void {
  void dracoLoader?.then((loader) => loader.dispose())
  dracoLoader = null
  for (const loader of ktx2Loaders.values()) void loader.then((ktx2) => ktx2.dispose())
  ktx2Loaders.clear()
  if (meshoptReady) {
    void import('three/examples/jsm/libs/meshopt_decoder.module.js').then(({ MeshoptDecoder }) => MeshoptDecoder.useWorkers(0))
    meshoptReady = null
  }
}

export class ParseAbortedError extends Error {
  constructor() {
    super('a newer document replaced this one')
    this.name = 'ParseAbortedError'
  }
}

export class ParseTimeoutError extends Error {
  constructor(ms: number) {
    super(`glTF parse did not finish within ${ms} ms`)
    this.name = 'ParseTimeoutError'
  }
}

/**
 * Rejects after `ms`, or when `signal` aborts; either way the decoders stop, and a result that
 * arrives later is released, since nobody will show it.
 */
function withLimits(parsing: Promise<GLTF>, ms: number, signal: AbortSignal | undefined): Promise<GLTF> {
  let timer: ReturnType<typeof setTimeout> | undefined
  let onAbort: (() => void) | undefined
  const abandon = (): void => {
    parsing.then((late) => late.scenes.forEach((scene) => disposeObjectTree(scene))).catch(() => {})
    stopDecoders()
  }
  const stopped = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      abandon()
      reject(new ParseTimeoutError(ms))
    }, ms)
    onAbort = () => {
      abandon()
      reject(new ParseAbortedError())
    }
    if (signal?.aborted) onAbort()
    else signal?.addEventListener('abort', onAbort, { once: true })
  })
  return Promise.race([parsing, stopped]).finally(() => {
    clearTimeout(timer)
    if (onAbort) signal?.removeEventListener('abort', onAbort)
  })
}

function rootNodeIndices(document: GltfDocument): number[] {
  const nodes = Array.isArray(document.nodes) ? document.nodes : []
  const children = new Set<number>()
  for (const node of nodes) {
    if (isRecord(node) && Array.isArray(node.children)) {
      for (const child of node.children) if (typeof child === 'number') children.add(child)
    }
  }
  return nodes.map((_, index) => index).filter((index) => !children.has(index))
}

/** The default scene; for a file with no scenes (a library of nodes), every root node. */
async function sceneOf(gltf: GLTF, document: GltfDocument): Promise<{ scene: Object3D; otherSceneCount: number }> {
  const sceneCount = Array.isArray(document.scenes) ? document.scenes.length : 0
  if (gltf.scene) {
    // Why release the other scenes: their decoded images would otherwise wait for garbage collection.
    // What they share with the default scene stays.
    const shown = resourcesOf(gltf.scene)
    for (const other of gltf.scenes) if (other !== gltf.scene) disposeObjectTree(other, shown)
    return { scene: gltf.scene, otherSceneCount: Math.max(0, sceneCount - 1) }
  }
  const group = new Group()
  for (const index of rootNodeIndices(document)) {
    group.add(await gltf.parser.getDependency('node', index))
  }
  return { scene: group, otherSceneCount: 0 }
}

export type ParseOptions = {
  /** Needed for KTX2 textures, which are transcoded to a format this GPU supports. */
  renderer?: WebGLRenderer
  timeoutMs?: number
  /** Aborts the parse, as a newer document arriving does. */
  signal?: AbortSignal
}

export async function parseGltfModel(
  data: GltfModelData,
  document: GltfDocument,
  { renderer, timeoutMs = PARSE_TIMEOUT_MS, signal }: ParseOptions = {}
): Promise<GltfModel> {
  const untrack = trackBlobUrls()
  try {
    const manager = new LoadingManager()
    manager.setURLModifier(resolveOwnUrl)
    const loader = new GLTFLoader(manager)
    if (gltfUsesExtension(document, GLTF_DRACO_EXTENSION)) {
      loader.setDRACOLoader(await sharedDracoLoader())
    }
    if (GLTF_MESHOPT_EXTENSIONS.some((extension) => gltfUsesExtension(document, extension))) {
      loader.setMeshoptDecoder(await meshoptDecoder())
    }
    if (renderer && gltfUsesExtension(document, GLTF_BASISU_EXTENSION)) {
      loader.setKTX2Loader(await sharedKtx2Loader(renderer))
    }
    // Why the parsed document for text: it saves parsing a large .gltf twice; a GLB needs its BIN chunk.
    // GLTFLoader.parse takes a parsed JSON object as well, though its typings list only text and bytes.
    const parse = loader.parseAsync.bind(loader) as (data: ArrayBuffer | string | GltfDocument, path: string) => Promise<GLTF>
    const gltf = await withLimits(parse(typeof data === 'string' ? document : data, ''), timeoutMs, signal)
    return { ...(await sceneOf(gltf, document)), animations: gltf.animations }
  } finally {
    untrack()
  }
}
