import { type AnimationClip, LoadingManager, type Object3D } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import {
  GLTF_DRACO_EXTENSION,
  GLTF_MESHOPT_EXTENSION,
  type GltfDocument,
  type GltfModelData,
  gltfUsesExtension
} from './gltf-document-inspection.ts'

export type GltfModel = {
  scene: Object3D
  animations: AnimationClip[]
}

// Why: the frame cannot read files beside the model. Callers refuse external buffers first, so only
// external images get here, and a white pixel stands in for each without a load error.
const BLOCKED_RESOURCE_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC'

export async function parseGltfModel(
  data: GltfModelData,
  document: GltfDocument
): Promise<GltfModel> {
  let draco: DRACOLoader | null = null
  try {
    const manager = new LoadingManager()
    manager.setURLModifier((url) =>
      url.startsWith('blob:') || url.startsWith('data:') ? url : BLOCKED_RESOURCE_URL
    )
    const loader = new GLTFLoader(manager)
    if (gltfUsesExtension(document, GLTF_DRACO_EXTENSION)) {
      draco = (await import('./draco-decoder.ts')).createDracoLoader()
      loader.setDRACOLoader(draco)
    }
    if (gltfUsesExtension(document, GLTF_MESHOPT_EXTENSION)) {
      const { MeshoptDecoder } = await import('three/examples/jsm/libs/meshopt_decoder.module.js')
      loader.setMeshoptDecoder(MeshoptDecoder)
    }
    return await new Promise<GltfModel>((resolve, reject) => {
      loader.parse(
        data,
        '',
        (gltf) => resolve({ scene: gltf.scene, animations: gltf.animations }),
        reject
      )
    })
  } finally {
    draco?.dispose()
  }
}
