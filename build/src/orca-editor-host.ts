// The part of the custom-editor frame API (`window.orca`) this read-only viewer uses.
// See https://github.com/stablyai/orca/blob/main/docs/reference/plugin-authoring.md#custom-editors

export type OrcaDocumentContent =
  | { kind: 'bytes'; bytes: ArrayBuffer }
  | { kind: 'text'; text: string }

export type OrcaDocument = {
  version: number
  readOnly: boolean
  content: OrcaDocumentContent
  fileType?: string
}

type OrcaEditorFrame = {
  locale?: string
  document?: {
    onDidChange: (listener: (document: OrcaDocument) => void) => unknown
  }
}

declare global {
  var orca: OrcaEditorFrame | undefined
}

export function editorFrame(): OrcaEditorFrame | undefined {
  return globalThis.orca
}
