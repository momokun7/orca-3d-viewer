// three.js ships its USDA parser without types; this covers what usd-inspection.ts calls.
declare module 'three/examples/jsm/loaders/usd/USDAParser.js' {
  export class USDAParser {
    parseData(text: string): { specsByPath: Record<string, { specType?: number; fields?: Record<string, unknown> }> }
  }
}
