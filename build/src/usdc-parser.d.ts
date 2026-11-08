// three.js ships its USDC parser without types; this covers the stages usdc-inspection.ts guards,
// and the state each stage leaves for the next.
declare module 'three/examples/jsm/loaders/usd/USDCParser.js' {
  export type CrateSpecs = Record<string, { specType?: number; fields?: Record<string, unknown> }>
  export class USDCParser {
    parseData(buffer: ArrayBuffer): { specsByPath: CrateSpecs }
    version: { major: number; minor: number; patch: number }
    tocOffset: number
    sections: Record<string, { start: number; size: number }>
    tokens: string[]
    fields: { tokenIndex: number; valueRep: { lo: number; hi: number } }[]
    fieldSets: number[]
    paths: string[]
    specs: { pathIndex: number; fieldSetIndex: number; specType: number }[]
    _readTOC(): void
    _readTokens(): void
    _readStrings(): void
    _readFields(): void
    _readFieldSets(): void
    _readPaths(): void
    _readSpecs(): void
    _buildPathsFromCompressed(pathIndices: Int32Array, elementTokenIndices: Int32Array, jumps: Int32Array): void
  }
}
