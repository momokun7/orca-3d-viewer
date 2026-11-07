// Holds the budget to what three.js actually does: documents of varied shape that pass the structure
// check and the budget are loaded with three.js' own GLTFLoader, and what it built is measured.
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import fc from 'fast-check'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { BUDGET, gltfBudgetExcess } from '../src/gltf-budget.ts'
import { glbLayoutProblem } from '../src/gltf-document-inspection.ts'
import { validateGltfStructure } from '../src/gltf-validation.ts'
import { loadedModelExcess } from '../src/loaded-model-limits.ts'
import { glb, type GltfJson, TRIANGLE_BIN, triangleGltf } from './fixtures/models.ts'

const FUZZ_RUNS = Number(process.env.ORACLE_RUNS ?? 60)
const FUZZ_SEED = process.env.FUZZ_SEED ? Number(process.env.FUZZ_SEED) : undefined

type Mutable = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

async function load(json: GltfJson): Promise<{ scene: import('three').Object3D; animations: import('three').AnimationClip[] }> {
  const bytes = glb(json)
  const gltf = await new GLTFLoader().parseAsync(bytes.buffer, '')
  return { scene: gltf.scene, animations: gltf.animations }
}

/** A zero-filled accessor of `count` elements (sparse, one value), so a large count costs no file bytes. */
function zeroFilled(json: Mutable, count: number, type = 'VEC3', componentType = 5126): number {
  json.accessors.push({ componentType, type, count, sparse: { count: 1, indices: { bufferView: 1, componentType: 5125 }, values: { bufferView: 0 } } })
  return json.accessors.length - 1
}

type Shape = {
  nodes: number
  meshes: number
  primitivesPerMesh: number
  vertices: number
  indices: number
  morphTargets: number
  instances: number
  weightChannels: number
  lightNodes: number
  parents: number[]
  meshOf: number[]
}

/** A document of the given shape over the shared triangle data. */
function documentOf(shape: Shape): Mutable {
  const json = triangleGltf() as Mutable
  const position = zeroFilled(json, shape.vertices)
  const indices = shape.indices > 0 ? zeroFilled(json, shape.indices, 'SCALAR', 5125) : undefined
  json.meshes = Array.from({ length: shape.meshes }, () => ({
    primitives: Array.from({ length: shape.primitivesPerMesh }, () => ({
      attributes: { POSITION: position },
      ...(indices === undefined ? {} : { indices }),
      ...(shape.morphTargets > 0 ? { targets: Array.from({ length: shape.morphTargets }, () => ({ POSITION: position })) } : {})
    }))
  }))
  const instanceTranslation = shape.instances > 1 ? zeroFilled(json, shape.instances) : undefined
  json.nodes = Array.from({ length: shape.nodes }, (_, index) => ({
    mesh: shape.meshOf[index] % shape.meshes,
    ...(instanceTranslation !== undefined && index === 0
      ? { extensions: { EXT_mesh_gpu_instancing: { attributes: { TRANSLATION: instanceTranslation } } } }
      : {}),
    ...(index < shape.lightNodes ? { extensions: { KHR_lights_punctual: { light: 0 } } } : {})
  }))
  if (shape.lightNodes > 0) json.extensions = { KHR_lights_punctual: { lights: [{ type: 'point' }] } }
  const roots: number[] = []
  for (let index = 0; index < shape.nodes; index++) {
    const parent = index === 0 ? -1 : shape.parents[index] % (index + 1)
    if (parent < 0 || parent === index) roots.push(index)
    else (json.nodes[parent].children ??= []).push(index)
  }
  json.scenes = [{ nodes: roots }]
  if (shape.weightChannels > 0 && shape.morphTargets > 0) {
    const input = 1
    const weights = zeroFilled(json, 2 * shape.morphTargets, 'SCALAR')
    json.animations = [
      {
        samplers: [{ input, output: weights }],
        channels: Array.from({ length: shape.weightChannels }, () => ({ sampler: 0, target: { node: 0, path: 'weights' } }))
      }
    ]
  }
  json.extensionsUsed = ['EXT_mesh_gpu_instancing', 'KHR_lights_punctual']
  return json
}

const shapes = fc.record({
  nodes: fc.integer({ min: 1, max: 40 }),
  meshes: fc.integer({ min: 1, max: 4 }),
  primitivesPerMesh: fc.integer({ min: 1, max: 3 }),
  vertices: fc.constantFrom(3, 1000, 100_000, 2_000_000),
  indices: fc.constantFrom(0, 3, 30_000, 3_000_000),
  morphTargets: fc.constantFrom(0, 1, 8, 64),
  instances: fc.constantFrom(1, 10, 10_000),
  weightChannels: fc.constantFrom(0, 1, 20),
  lightNodes: fc.constantFrom(0, 1, 30),
  parents: fc.array(fc.nat(), { minLength: 40, maxLength: 40 }),
  meshOf: fc.array(fc.nat(), { minLength: 40, maxLength: 40 })
})

describe('the budget against three.js', () => {
  it('whenever a document passes the checks, what three.js builds stays within the loaded-model limits', async () => {
    let loaded = 0
    await fc.assert(
      fc.asyncProperty(shapes, async (shape) => {
        const json = documentOf(shape)
        if (validateGltfStructure(json, TRIANGLE_BIN.length) || gltfBudgetExcess(json, TRIANGLE_BIN)) return
        loaded++
        const before = process.memoryUsage().arrayBuffers
        const model = await load(json)
        const grown = process.memoryUsage().arrayBuffers - before
        assert.equal(loadedModelExcess(model.scene, model.animations), null, JSON.stringify(shape))
        assert.ok(grown <= BUDGET.geometryBytes, `three.js allocated ${grown} bytes for ${JSON.stringify(shape)}`)
      }),
      { numRuns: FUZZ_RUNS, seed: FUZZ_SEED }
    )
    console.log(`oracle: three.js loaded ${loaded} of ${FUZZ_RUNS} generated documents`)
    assert.ok(loaded > FUZZ_RUNS / 4, `only ${loaded} of ${FUZZ_RUNS} shapes passed the checks, too few to compare`)
  })
})

describe('the multipliers round 4 found', () => {
  it('refuses a GLB with a second JSON or BIN chunk, which three.js would read instead', () => {
    const one = glb(triangleGltf())
    const json = new TextEncoder().encode(JSON.stringify({ asset: { version: '2.0' }, nodes: [{ name: 'HOSTILE' }] }).padEnd(48, ' '))
    const extra = new Uint8Array(8 + json.length)
    new DataView(extra.buffer).setUint32(0, json.length, true)
    new DataView(extra.buffer).setUint32(4, 0x4e4f534a, true)
    extra.set(json, 8)
    const two = new Uint8Array(one.length + extra.length)
    two.set(one)
    two.set(extra, one.length)
    new DataView(two.buffer).setUint32(8, two.length, true)
    assert.match(glbLayoutProblem(two.buffer) ?? '', /one JSON and one BIN/)
    assert.match(glbLayoutProblem(one.slice(0, -4).buffer) ?? '', /length/)
    assert.equal(glbLayoutProblem(one.buffer), null)
  })

  it('charges every buffer view three.js copies, once each', () => {
    const json = triangleGltf() as Mutable
    json.buffers = [{ byteLength: 68 }, { byteLength: 16 * 1024 * 1024, uri: 'data:,' }]
    json.bufferViews.push(...Array.from({ length: 64 }, () => ({ buffer: 1, byteLength: 16 * 1024 * 1024 })))
    json.accessors.push(...Array.from({ length: 64 }, (_, index) => ({ bufferView: 3 + index, componentType: 5126, type: 'VEC3', count: 1 })))
    json.meshes[0].primitives[0].attributes = Object.fromEntries(
      Array.from({ length: 64 }, (_, index) => [index === 0 ? 'POSITION' : `_A${index}`, 3 + index])
    )
    assert.equal(validateGltfStructure(json, 68), null)
    assert.equal(gltfBudgetExcess(json, TRIANGLE_BIN)?.kind, 'geometryBytes')
  })

  it('counts drawn vertices by index, so a 3-vertex mesh with billions of indices is refused', () => {
    const json = triangleGltf() as Mutable
    const indices = zeroFilled(json, 400_000_000, 'SCALAR', 5121)
    json.meshes[0].primitives[0].indices = indices
    json.nodes = Array.from({ length: 1000 }, () => ({ mesh: 0 }))
    assert.equal(validateGltfStructure(json, 68), null)
    assert.equal(gltfBudgetExcess(json, TRIANGLE_BIN)?.kind, 'drawnVertices')
  })

  it('counts weights tracks three.js builds for each morph child of a multi-primitive node', () => {
    const json = documentOf({
      nodes: 2001,
      meshes: 1,
      primitivesPerMesh: 2,
      vertices: 3,
      indices: 0,
      morphTargets: 1,
      instances: 1,
      weightChannels: 60,
      lightNodes: 0,
      parents: Array.from({ length: 2001 }, () => 0),
      meshOf: Array.from({ length: 2001 }, () => 0)
    })
    assert.equal(validateGltfStructure(json, 68), null)
    assert.equal(gltfBudgetExcess(json, TRIANGLE_BIN)?.kind, 'animationTracks')
  })

  it('caps nodes that place a light, since three.js clones the light for each', () => {
    const json = triangleGltf() as Mutable
    json.extensions = { KHR_lights_punctual: { lights: [{ type: 'point' }] } }
    json.nodes = Array.from({ length: 100 }, () => ({ extensions: { KHR_lights_punctual: { light: 0 } } }))
    assert.match(validateGltfStructure(json, 68)?.reason ?? '', /place more than/)
  })
})
