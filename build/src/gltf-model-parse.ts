import { type AnimationClip, Group, LoadingManager, type Object3D } from 'three'
import type { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { type GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import {
  GLTF_DRACO_EXTENSION,
  GLTF_MESHOPT_EXTENSIONS,
  type GltfDocument,
  type GltfModelData,
  gltfJsonText,
  gltfUsesExtension,
  isDataUri,
  isRecord
} from './gltf-document-inspection.ts'
import { disposeObjectTree } from './model-disposal.ts'

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

// Blob URLs created while any parse runs; GLTFLoader creates its image URLs synchronously within.
const ownBlobUrls = new Set<string>()
let activeParses = 0
let originalCreateObjectURL: typeof URL.createObjectURL | null = null

function trackBlobUrls(): () => void {
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

let dracoLoader: Promise<DRACOLoader> | null = null

function sharedDracoLoader(): Promise<DRACOLoader> {
  // Why shared: each new loader re-fetches and compiles the decoder and starts its own workers.
  dracoLoader ??= import('./draco-decoder.ts').then(({ createDracoLoader }) => createDracoLoader())
  return dracoLoader
}

export class ParseTimeoutError extends Error {
  constructor(ms: number) {
    super(`glTF parse did not finish within ${ms} ms`)
    this.name = 'ParseTimeoutError'
  }
}

/** Rejects after `ms`; a result that arrives later is released, since nobody will show it. */
function withTimeout(parsing: Promise<GLTF>, ms: number): Promise<GLTF> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      parsing.then((late) => disposeObjectTree(late.scene)).catch(() => {})
      reject(new ParseTimeoutError(ms))
    }, ms)
  })
  return Promise.race([parsing, timeout]).finally(() => clearTimeout(timer))
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
    return { scene: gltf.scene, otherSceneCount: Math.max(0, sceneCount - 1) }
  }
  const group = new Group()
  for (const index of rootNodeIndices(document)) {
    group.add(await gltf.parser.getDependency('node', index))
  }
  return { scene: group, otherSceneCount: 0 }
}

export async function parseGltfModel(
  data: GltfModelData,
  document: GltfDocument,
  timeoutMs = PARSE_TIMEOUT_MS
): Promise<GltfModel> {
  const untrack = trackBlobUrls()
  try {
    const manager = new LoadingManager()
    manager.setURLModifier((url) => resolveResourceUrl(url, ownBlobUrls))
    const loader = new GLTFLoader(manager)
    if (gltfUsesExtension(document, GLTF_DRACO_EXTENSION)) {
      loader.setDRACOLoader(await sharedDracoLoader())
    }
    if (GLTF_MESHOPT_EXTENSIONS.some((extension) => gltfUsesExtension(document, extension))) {
      const { MeshoptDecoder } = await import('three/examples/jsm/libs/meshopt_decoder.module.js')
      loader.setMeshoptDecoder(MeshoptDecoder)
    }
    const input = typeof data === 'string' ? (gltfJsonText(data) ?? data) : data
    const gltf = await withTimeout(loader.parseAsync(input, ''), timeoutMs)
    return { ...(await sceneOf(gltf, document)), animations: gltf.animations }
  } finally {
    untrack()
  }
}
