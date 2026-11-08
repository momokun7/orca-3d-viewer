// USD layers and USDZ packages built in memory, small enough to read in a test.
import { strToU8, zipSync } from 'three/examples/jsm/libs/fflate.module.js'

/** A USDA layer: a header with `metersPerUnit` when given, then `body`. */
export function usda(body: string, { metersPerUnit }: { metersPerUnit?: number } = {}): string {
  const header = metersPerUnit === undefined ? '' : `    metersPerUnit = ${metersPerUnit}\n`
  return `#usda 1.0\n(\n    defaultPrim = "Root"\n${header}    upAxis = "Y"\n)\n\ndef Xform "Root"\n{\n${body}}\n`
}

/** A prim holding one triangle. */
export function triangle(name = 'Tri'): string {
  return `    def Mesh "${name}"\n    {\n        int[] faceVertexCounts = [3]\n        int[] faceVertexIndices = [0, 1, 2]\n        point3f[] points = [(0, 0, 0), (1, 0, 0), (0, 1, 0)]\n    }\n`
}

/** An Xform that moves along X over a second, holding one triangle. */
export function moving(): string {
  const samples = `        double3 xformOp:translate.timeSamples = {
            0: (0, 0, 0),
            24: (1, 0, 0),
        }
`
  return `    def Xform "Mover"
    {
${samples}        uniform token[] xformOpOrder = ["xformOp:translate"]
${triangle().replace(/^/gm, '    ')}    }
`
}

/** A prim that references `path`, once per entry of `times`. */
export function reference(name: string, path: string, times = 1): string {
  const arcs = Array.from({ length: times }, () => `@${path}@`).join(', ')
  return `    def Xform "${name}" (\n        prepend references = [${arcs}]\n    )\n    {\n    }\n`
}

/** A prim whose material samples the image at `path`. */
export function textured(path: string): string {
  return (
    `    def Material "Mat"\n    {\n        def Shader "Tex"\n        {\n` +
    `            uniform token info:id = "UsdUVTexture"\n            asset inputs:file = @${path}@\n        }\n    }\n`
  )
}

/** A square facing the camera whose material shows the image at `path` across it. */
export function texturedSquare(path: string): string {
  return (
    `    def Mesh "Square" (\n        prepend apiSchemas = ["MaterialBindingAPI"]\n    )\n    {\n` +
    `        int[] faceVertexCounts = [4]\n        int[] faceVertexIndices = [0, 1, 2, 3]\n` +
    `        point3f[] points = [(-1, -1, 0), (1, -1, 0), (1, 1, 0), (-1, 1, 0)]\n` +
    `        texCoord2f[] primvars:st = [(0, 0), (1, 0), (1, 1), (0, 1)] (\n            interpolation = "vertex"\n        )\n` +
    `        rel material:binding = </Root/Mat>\n    }\n` +
    `    def Material "Mat"\n    {\n        token outputs:surface.connect = </Root/Mat/Surface.outputs:surface>\n` +
    `        def Shader "Surface"\n        {\n            uniform token info:id = "UsdPreviewSurface"\n` +
    `            color3f inputs:diffuseColor.connect = </Root/Mat/Tex.outputs:rgb>\n            token outputs:surface\n        }\n` +
    `        def Shader "Tex"\n        {\n            uniform token info:id = "UsdUVTexture"\n            asset inputs:file = @${path}@\n` +
    `            float3 outputs:rgb\n        }\n    }\n`
  )
}

/** A USDZ package of `files` in order, stored uncompressed unless `level` says otherwise. */
export function usdz(files: [string, string | Uint8Array][], level: 0 | 6 = 0): Uint8Array {
  const entries: Record<string, Uint8Array> = {}
  for (const [name, content] of files) entries[name] = typeof content === 'string' ? strToU8(content) : content
  return zipSync(entries, { level })
}

/** `zipped` with every occurrence of the entry name `from` replaced by `to`, which has the same length. */
export function renamed(zipped: Uint8Array, from: string, to: string): Uint8Array {
  const out = zipped.slice()
  const search = strToU8(from)
  for (let at = 0; at + search.length <= out.length; at++) {
    if (search.every((byte, index) => out[at + index] === byte)) out.set(strToU8(to), at)
  }
  return out
}
