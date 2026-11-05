// Checks the parts of a glTF document three.js reads without checking: every index in range, every
// enum one the spec allows, every count and offset a safe integer, and a node graph that is a forest.
// GLTFLoader turns any of these into a TypeError deep in its parser, or into unbounded work.
import { GLTF_MESHOPT_EXTENSIONS, type GltfDocument, isRecord } from './gltf-document-inspection.ts'

export const COMPONENT_BYTES = new Map([
  [5120, 1],
  [5121, 1],
  [5122, 2],
  [5123, 2],
  [5125, 4],
  [5126, 4]
])
export const TYPE_COMPONENTS = new Map([
  ['SCALAR', 1],
  ['VEC2', 2],
  ['VEC3', 3],
  ['VEC4', 4],
  ['MAT2', 4],
  ['MAT3', 9],
  ['MAT4', 16]
])
const INDEX_COMPONENT_TYPES = new Set([5121, 5123, 5125])
const INTERPOLATIONS = new Set(['LINEAR', 'STEP', 'CUBICSPLINE'])
const MESHOPT_MODES = new Set(['ATTRIBUTES', 'TRIANGLES', 'INDICES'])
const MESHOPT_FILTERS = new Set(['NONE', 'OCTAHEDRAL', 'QUATERNION', 'EXPONENTIAL', 'COLOR'])

/** Caps on how many of each thing a document may hold, so walking it stays cheap. */
export const STRUCTURE_LIMITS = {
  elements: 1_000_000,
  primitivesPerMesh: 4096,
  attributesPerPrimitive: 64,
  morphTargetsPerPrimitive: 256,
  lights: 64,
  childrenPerNode: 1_000_000
} as const

export type StructureProblem = { path: string; reason: string }

type Records = Record<string, unknown>[]

function list(document: GltfDocument, key: string): Records | null {
  const value = document[key]
  if (value === undefined) return []
  return Array.isArray(value) && value.every(isRecord) ? (value as Records) : null
}

const isCount = (value: unknown, min = 0): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= min
const isIndex = (value: unknown, length: number): value is number => isCount(value) && value < length
const isOptionalIndex = (value: unknown, length: number): boolean => value === undefined || isIndex(value, length)
const finiteNumbers = (value: unknown, length: number): boolean =>
  value === undefined ||
  (Array.isArray(value) && value.length === length && value.every((entry) => typeof entry === 'number' && Number.isFinite(entry)))

export function validateGltfStructure(document: GltfDocument, binLength: number | null): StructureProblem | null {
  const problem = (path: string, reason: string): StructureProblem => ({ path, reason })
  const asset = document.asset
  if (!isRecord(asset) || typeof asset.version !== 'string' || !/^2\.\d+$/.test(asset.version)) {
    return problem('asset.version', 'is not glTF 2.x')
  }

  const lists: Record<string, Records> = {}
  for (const key of [
    'accessors',
    'animations',
    'buffers',
    'bufferViews',
    'cameras',
    'images',
    'materials',
    'meshes',
    'nodes',
    'samplers',
    'scenes',
    'skins',
    'textures'
  ]) {
    const entries = list(document, key)
    if (!entries) return problem(key, 'is not a list of objects')
    if (entries.length > STRUCTURE_LIMITS.elements) return problem(key, 'has too many entries')
    lists[key] = entries
  }
  const { accessors, animations, buffers, bufferViews, cameras, images, materials, meshes, nodes, samplers, scenes, skins, textures } =
    lists

  for (const [index, buffer] of buffers.entries()) {
    if (!isCount(buffer.byteLength, 1)) return problem(`buffers[${index}].byteLength`, 'is not a positive integer')
    if (buffer.uri !== undefined && typeof buffer.uri !== 'string') return problem(`buffers[${index}].uri`, 'is not a string')
    if (buffer.uri === undefined && index === 0 && binLength !== null && buffer.byteLength > binLength) {
      return problem('buffers[0].byteLength', 'is longer than the GLB BIN chunk')
    }
  }

  for (const [index, view] of bufferViews.entries()) {
    const path = `bufferViews[${index}]`
    if (!isIndex(view.buffer, buffers.length)) return problem(`${path}.buffer`, 'is not a buffer')
    const offset = view.byteOffset ?? 0
    if (!isCount(offset) || !isCount(view.byteLength, 1)) return problem(path, 'has an invalid byte range')
    if (offset + view.byteLength > (buffers[view.buffer].byteLength as number)) return problem(path, 'runs past its buffer')
    if (view.byteStride !== undefined && (!isCount(view.byteStride, 4) || view.byteStride > 252 || view.byteStride % 4 !== 0)) {
      return problem(`${path}.byteStride`, 'is not a multiple of 4 between 4 and 252')
    }
    const extensions = isRecord(view.extensions) ? view.extensions : {}
    for (const name of GLTF_MESHOPT_EXTENSIONS) {
      const meshopt = extensions[name]
      if (meshopt === undefined) continue
      if (!isRecord(meshopt) || !isIndex(meshopt.buffer, buffers.length)) return problem(`${path}.${name}`, 'has no valid buffer')
      const sourceOffset = meshopt.byteOffset ?? 0
      if (!isCount(sourceOffset) || !isCount(meshopt.byteLength, 1)) return problem(`${path}.${name}`, 'has an invalid byte range')
      if (sourceOffset + meshopt.byteLength > (buffers[meshopt.buffer].byteLength as number)) {
        return problem(`${path}.${name}`, 'runs past its buffer')
      }
      if (!isCount(meshopt.count, 1) || !isCount(meshopt.byteStride, 1) || meshopt.byteStride > 256) {
        return problem(`${path}.${name}`, 'has an invalid count or stride')
      }
      if (meshopt.count * meshopt.byteStride !== view.byteLength) {
        return problem(`${path}.${name}`, 'decodes to a size other than its buffer view')
      }
      if (typeof meshopt.mode !== 'string' || !MESHOPT_MODES.has(meshopt.mode)) return problem(`${path}.${name}.mode`, 'is unknown')
      if (meshopt.filter !== undefined && (typeof meshopt.filter !== 'string' || !MESHOPT_FILTERS.has(meshopt.filter))) {
        return problem(`${path}.${name}.filter`, 'is unknown')
      }
    }
  }

  const fits = (viewIndex: number, byteOffset: number, count: number, elementBytes: number): boolean => {
    const view = bufferViews[viewIndex]
    const stride = (view.byteStride as number | undefined) ?? elementBytes
    return byteOffset + (count - 1) * stride + elementBytes <= (view.byteLength as number)
  }
  for (const [index, accessor] of accessors.entries()) {
    const path = `accessors[${index}]`
    const componentBytes = COMPONENT_BYTES.get(accessor.componentType as number)
    const components = TYPE_COMPONENTS.get(accessor.type as string)
    if (componentBytes === undefined || components === undefined) return problem(path, 'has an unknown componentType or type')
    if (!isCount(accessor.count, 1)) return problem(`${path}.count`, 'is not a positive integer')
    const offset = accessor.byteOffset ?? 0
    if (!isCount(offset)) return problem(`${path}.byteOffset`, 'is not a non-negative integer')
    if (accessor.bufferView !== undefined) {
      if (!isIndex(accessor.bufferView, bufferViews.length)) return problem(`${path}.bufferView`, 'is not a buffer view')
      const view = bufferViews[accessor.bufferView]
      // Why: typed-array views over unaligned offsets throw a RangeError inside the loader.
      if ((((view.byteOffset as number | undefined) ?? 0) + offset) % componentBytes !== 0) {
        return problem(`${path}.byteOffset`, 'is not aligned to its component size')
      }
      const stride = view.byteStride as number | undefined
      if (stride !== undefined && (offset + componentBytes * components > stride || stride % componentBytes !== 0)) {
        return problem(path, 'does not fit its buffer view’s stride')
      }
      if (!fits(accessor.bufferView, offset, accessor.count, componentBytes * components)) return problem(path, 'reads past its buffer view')
    } else if (offset !== 0) {
      return problem(`${path}.byteOffset`, 'is set without a buffer view')
    }
    if (accessor.sparse !== undefined) {
      const sparse = accessor.sparse
      if (!isRecord(sparse) || !isCount(sparse.count, 1) || sparse.count > accessor.count) return problem(`${path}.sparse`, 'has an invalid count')
      const indices = sparse.indices
      const values = sparse.values
      if (!isRecord(indices) || !isIndex(indices.bufferView, bufferViews.length) || !INDEX_COMPONENT_TYPES.has(indices.componentType as number)) {
        return problem(`${path}.sparse.indices`, 'is invalid')
      }
      if (!isRecord(values) || !isIndex(values.bufferView, bufferViews.length)) return problem(`${path}.sparse.values`, 'is invalid')
      const indicesOffset = indices.byteOffset ?? 0
      const valuesOffset = values.byteOffset ?? 0
      if (!isCount(indicesOffset) || !isCount(valuesOffset)) return problem(`${path}.sparse`, 'has an invalid offset')
      if (
        !fits(indices.bufferView, indicesOffset, sparse.count, COMPONENT_BYTES.get(indices.componentType as number)!) ||
        !fits(values.bufferView, valuesOffset, sparse.count, componentBytes * components)
      ) {
        return problem(`${path}.sparse`, 'reads past its buffer views')
      }
    }
  }

  // POSITION bounds frame the model and cull it, so they must be finite and ordered.
  for (const mesh of meshes) {
    for (const primitive of Array.isArray(mesh.primitives) ? mesh.primitives : []) {
      const position = isRecord(primitive) && isRecord(primitive.attributes) ? primitive.attributes.POSITION : undefined
      if (!isIndex(position, accessors.length)) continue
      const accessor = accessors[position]
      if (accessor.type !== 'VEC3') return problem(`accessors[${position}]`, 'is a POSITION that is not VEC3')
      const { min, max } = accessor
      if (min !== undefined || max !== undefined) {
        if (!finiteNumbers(min, 3) || !finiteNumbers(max, 3) || !(min as number[]).every((value, axis) => value <= (max as number[])[axis])) {
          return problem(`accessors[${position}]`, 'has POSITION bounds that are not finite and ordered')
        }
      }
    }
  }

  for (const [index, image] of images.entries()) {
    const hasUri = typeof image.uri === 'string'
    if (hasUri === (image.bufferView !== undefined)) return problem(`images[${index}]`, 'needs exactly one of uri and bufferView')
    if (!hasUri && !isIndex(image.bufferView, bufferViews.length)) return problem(`images[${index}].bufferView`, 'is not a buffer view')
  }
  for (const [index, texture] of textures.entries()) {
    if (!isOptionalIndex(texture.source, images.length) || !isOptionalIndex(texture.sampler, samplers.length)) {
      return problem(`textures[${index}]`, 'refers to a missing image or sampler')
    }
    const extensions = isRecord(texture.extensions) ? texture.extensions : {}
    for (const [name, extension] of Object.entries(extensions)) {
      if (isRecord(extension) && !isOptionalIndex(extension.source, images.length)) {
        return problem(`textures[${index}].extensions.${name}.source`, 'is not an image')
      }
    }
  }

  // Any { index } under a key ending in "Texture", at any depth of a material and its extensions.
  const textureRefProblem = (value: unknown, path: string, depth: number): StructureProblem | null => {
    if (depth > 16 || !isRecord(value)) return null
    for (const [key, child] of Object.entries(value)) {
      if (/Texture$/.test(key) && isRecord(child) && !isIndex(child.index, textures.length)) {
        return problem(`${path}.${key}.index`, 'is not a texture')
      }
      const nested = textureRefProblem(child, `${path}.${key}`, depth + 1)
      if (nested) return nested
    }
    return null
  }
  for (const [index, material] of materials.entries()) {
    const nested = textureRefProblem(material, `materials[${index}]`, 0)
    if (nested) return nested
  }

  for (const [meshIndex, mesh] of meshes.entries()) {
    const primitives = mesh.primitives
    if (!Array.isArray(primitives) || primitives.length === 0 || primitives.length > STRUCTURE_LIMITS.primitivesPerMesh) {
      return problem(`meshes[${meshIndex}].primitives`, 'is empty or too long')
    }
    for (const [primitiveIndex, primitive] of primitives.entries()) {
      const path = `meshes[${meshIndex}].primitives[${primitiveIndex}]`
      if (!isRecord(primitive) || !isRecord(primitive.attributes)) return problem(path, 'has no attributes')
      const attributes = Object.values(primitive.attributes)
      if (attributes.length > STRUCTURE_LIMITS.attributesPerPrimitive || !attributes.every((value) => isIndex(value, accessors.length))) {
        return problem(`${path}.attributes`, 'refers to a missing accessor')
      }
      if (!isOptionalIndex(primitive.indices, accessors.length)) return problem(`${path}.indices`, 'is not an accessor')
      if (!isOptionalIndex(primitive.material, materials.length)) return problem(`${path}.material`, 'is not a material')
      if (primitive.mode !== undefined && !(isCount(primitive.mode) && primitive.mode <= 6)) return problem(`${path}.mode`, 'is unknown')
      if (primitive.targets !== undefined) {
        const targets = primitive.targets
        if (
          !Array.isArray(targets) ||
          targets.length > STRUCTURE_LIMITS.morphTargetsPerPrimitive ||
          !targets.every((target) => isRecord(target) && Object.values(target).every((value) => isIndex(value, accessors.length)))
        ) {
          return problem(`${path}.targets`, 'refers to a missing accessor')
        }
      }
      const extensions = isRecord(primitive.extensions) ? primitive.extensions : {}
      const draco = extensions.KHR_draco_mesh_compression
      if (draco !== undefined) {
        if (!isRecord(draco) || !isIndex(draco.bufferView, bufferViews.length) || !isRecord(draco.attributes)) {
          return problem(`${path}.extensions.KHR_draco_mesh_compression`, 'is invalid')
        }
        if (!Object.values(draco.attributes).every((value) => isCount(value))) {
          return problem(`${path}.extensions.KHR_draco_mesh_compression.attributes`, 'are not attribute ids')
        }
      }
    }
  }

  const documentExtensions = isRecord(document.extensions) ? document.extensions : {}
  const lightsExtension = documentExtensions.KHR_lights_punctual
  const lights = isRecord(lightsExtension) && Array.isArray(lightsExtension.lights) ? lightsExtension.lights : []
  // Why a cap: every light becomes a loop in every fragment shader.
  if (lights.length > STRUCTURE_LIMITS.lights) return problem('extensions.KHR_lights_punctual.lights', `has more than ${STRUCTURE_LIMITS.lights}`)

  const parents = new Int32Array(nodes.length).fill(-1)
  for (const [index, node] of nodes.entries()) {
    const path = `nodes[${index}]`
    if (!isOptionalIndex(node.mesh, meshes.length) || !isOptionalIndex(node.skin, skins.length) || !isOptionalIndex(node.camera, cameras.length)) {
      return problem(path, 'refers to a missing mesh, skin or camera')
    }
    if (!finiteNumbers(node.matrix, 16) || !finiteNumbers(node.translation, 3) || !finiteNumbers(node.rotation, 4) || !finiteNumbers(node.scale, 3)) {
      return problem(path, 'has a transform that is not finite numbers')
    }
    const nodeExtensions = isRecord(node.extensions) ? node.extensions : {}
    const instancing = nodeExtensions.EXT_mesh_gpu_instancing
    if (instancing !== undefined) {
      const attributes = isRecord(instancing) && isRecord(instancing.attributes) ? instancing.attributes : null
      if (!attributes || Object.keys(attributes).length === 0) return problem(`${path}.extensions.EXT_mesh_gpu_instancing`, 'has no attributes')
      let instances: number | null = null
      for (const [name, value] of Object.entries(attributes)) {
        if (!isIndex(value, accessors.length)) return problem(`${path}.extensions.EXT_mesh_gpu_instancing.${name}`, 'is not an accessor')
        const accessor = accessors[value]
        const expectedType = name === 'ROTATION' ? 'VEC4' : name === 'TRANSLATION' || name === 'SCALE' ? 'VEC3' : null
        const floatOrNormalized = accessor.componentType === 5126 || (accessor.normalized === true && name === 'ROTATION')
        if (expectedType && (accessor.type !== expectedType || !floatOrNormalized)) {
          return problem(`${path}.extensions.EXT_mesh_gpu_instancing.${name}`, 'has the wrong type')
        }
        if (instances !== null && accessor.count !== instances) {
          return problem(`${path}.extensions.EXT_mesh_gpu_instancing`, 'has attributes of different counts')
        }
        instances = accessor.count as number
      }
    }
    const light = nodeExtensions.KHR_lights_punctual
    if (light !== undefined && !(isRecord(light) && isIndex(light.light, lights.length))) {
      return problem(`${path}.extensions.KHR_lights_punctual.light`, 'is not a light')
    }
    if (node.children !== undefined) {
      if (!Array.isArray(node.children) || node.children.length > STRUCTURE_LIMITS.childrenPerNode) return problem(`${path}.children`, 'is not a list')
      for (const child of node.children) {
        if (!isIndex(child, nodes.length) || child === index) return problem(`${path}.children`, 'refers to a missing node or itself')
        if (parents[child] !== -1) return problem(`nodes[${child}]`, 'has more than one parent')
        parents[child] = index
      }
    }
  }
  // Why: with one parent each, a cycle is the only way a node has no root above it.
  const state = new Uint8Array(nodes.length)
  for (let start = 0; start < nodes.length; start++) {
    let node = start
    const path: number[] = []
    while (node !== -1 && state[node] === 0) {
      state[node] = 1
      path.push(node)
      node = parents[node]
    }
    if (node !== -1 && state[node] === 1) return problem(`nodes[${node}]`, 'is its own ancestor')
    for (const visited of path) state[visited] = 2
  }

  for (const [index, scene] of scenes.entries()) {
    if (scene.nodes !== undefined && (!Array.isArray(scene.nodes) || !scene.nodes.every((node) => isIndex(node, nodes.length)))) {
      return problem(`scenes[${index}].nodes`, 'refers to a missing node')
    }
  }
  if (!isOptionalIndex(document.scene, scenes.length)) return problem('scene', 'is not a scene')

  for (const [index, skin] of skins.entries()) {
    const joints = skin.joints
    if (!Array.isArray(joints) || joints.length === 0 || !joints.every((joint) => isIndex(joint, nodes.length))) {
      return problem(`skins[${index}].joints`, 'refers to a missing node')
    }
    if (!isOptionalIndex(skin.inverseBindMatrices, accessors.length) || !isOptionalIndex(skin.skeleton, nodes.length)) {
      return problem(`skins[${index}]`, 'refers to a missing accessor or node')
    }
    if (skin.inverseBindMatrices !== undefined) {
      const matrices = accessors[skin.inverseBindMatrices as number]
      if (matrices.type !== 'MAT4' || matrices.componentType !== 5126 || (matrices.count as number) < joints.length) {
        return problem(`skins[${index}].inverseBindMatrices`, 'is not a float MAT4 per joint')
      }
    }
  }

  // Output type each animated property takes, and whether normalized integers are allowed.
  const ANIMATION_OUTPUTS: Record<string, { type: string; normalized: boolean }> = {
    translation: { type: 'VEC3', normalized: false },
    scale: { type: 'VEC3', normalized: false },
    rotation: { type: 'VEC4', normalized: true },
    weights: { type: 'SCALAR', normalized: true }
  }
  const morphTargets = (meshIndex: number): number => {
    const primitive = (meshes[meshIndex].primitives as unknown[])[0]
    return isRecord(primitive) && Array.isArray(primitive.targets) ? primitive.targets.length : 0
  }

  for (const [index, animation] of animations.entries()) {
    const path = `animations[${index}]`
    const samplerList = animation.samplers
    const channels = animation.channels
    if (!Array.isArray(samplerList) || !Array.isArray(channels)) return problem(path, 'has no samplers or channels')
    for (const sampler of samplerList) {
      if (!isRecord(sampler) || !isIndex(sampler.input, accessors.length) || !isIndex(sampler.output, accessors.length)) {
        return problem(`${path}.samplers`, 'refer to a missing accessor')
      }
      if (sampler.interpolation !== undefined && !INTERPOLATIONS.has(sampler.interpolation as string)) {
        return problem(`${path}.samplers`, 'use an unknown interpolation')
      }
    }
    for (const channel of channels) {
      if (!isRecord(channel) || !isIndex(channel.sampler, samplerList.length) || !isRecord(channel.target)) {
        return problem(`${path}.channels`, 'refer to a missing sampler')
      }
      if (!isOptionalIndex(channel.target.node, nodes.length) || typeof channel.target.path !== 'string') {
        return problem(`${path}.channels`, 'target a missing node')
      }
      const output = ANIMATION_OUTPUTS[channel.target.path]
      if (!output || channel.target.node === undefined) continue
      const sampler = samplerList[channel.sampler as number] as Record<string, unknown>
      const input = accessors[sampler.input as number]
      const values = accessors[sampler.output as number]
      if (input.type !== 'SCALAR' || input.componentType !== 5126) return problem(`${path}.samplers`, 'have input that is not float scalars')
      if (values.type !== output.type || !(values.componentType === 5126 || (output.normalized && values.normalized === true))) {
        return problem(`${path}.samplers`, `have ${channel.target.path} output of the wrong type`)
      }
      const node = nodes[channel.target.node as number]
      const perKey =
        (sampler.interpolation === 'CUBICSPLINE' ? 3 : 1) *
        (channel.target.path === 'weights' && typeof node.mesh === 'number' ? morphTargets(node.mesh) : 1)
      if (values.count !== (input.count as number) * perKey) {
        return problem(`${path}.samplers`, 'have output counts that do not match their keyframes')
      }
    }
  }

  for (const [index, camera] of cameras.entries()) {
    if (camera.type !== 'perspective' && camera.type !== 'orthographic') return problem(`cameras[${index}].type`, 'is unknown')
  }
  return null
}
