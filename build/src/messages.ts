const EN = {
  loading: 'Loading 3D model…',
  contextLost: 'The 3D view was reset by the graphics driver. Reopen the file to view it again.',
  parseFailed:
    'Unable to display this 3D model. It may be corrupt or use an unsupported extension.',
  externalBuffers:
    'This model keeps its geometry in separate files ({{files}}), which Orca plugins cannot read. Open a .glb, or a .gltf with its data embedded.',
  externalImages:
    'Textures in separate files ({{files}}) are not shown: Orca plugins cannot read files beside the model. Use a .glb to see them.',
  resetView: 'Reset view',
  wireframe: 'Wireframe',
  guides: 'Grid and axes',
  playAnimation: 'Play animation',
  pauseAnimation: 'Pause animation',
  animation: 'Animation',
  animationFallback: 'Animation {{index}}',
  stats: '{{vertices}} vertices · {{triangles}} triangles',
  dimensionsTitle: 'Width × height × depth, in meters',
  dimensions: '{{width}} × {{height}} × {{depth}} m',
  gridCell: 'Grid {{size}} m'
}

export type MessageKey = keyof typeof EN

const JA: Record<MessageKey, string> = {
  loading: '3D モデルを読み込み中…',
  contextLost:
    'グラフィックドライバーにより 3D 表示がリセットされました。ファイルを開き直すと再表示できます。',
  parseFailed:
    'この 3D モデルを表示できません。ファイルが壊れているか、未対応の拡張機能を使っている可能性があります。',
  externalBuffers:
    'このモデルは形状データを別のファイル({{files}})に持っていますが、Orca のプラグインはそれを読み込めません。.glb か、データを埋め込んだ .gltf を開いてください。',
  externalImages:
    '別のファイルのテクスチャ({{files}})は表示されません。Orca のプラグインはモデルの隣にあるファイルを読み込めないためです。.glb にすると表示できます。',
  resetView: '視点をリセット',
  wireframe: 'ワイヤーフレーム',
  guides: 'グリッドと軸',
  playAnimation: 'アニメーションを再生',
  pauseAnimation: 'アニメーションを一時停止',
  animation: 'アニメーション',
  animationFallback: 'アニメーション {{index}}',
  stats: '{{vertices}} 頂点 · {{triangles}} 三角形',
  dimensionsTitle: '幅 × 高さ × 奥行き(メートル)',
  dimensions: '{{width}} × {{height}} × {{depth}} m',
  gridCell: 'グリッド {{size}} m'
}

export type Translate = (key: MessageKey, values?: Record<string, string | number>) => string

export function createTranslate(locale: string | undefined): Translate {
  const table = locale?.toLowerCase().startsWith('ja') ? JA : EN
  return (key, values = {}) =>
    table[key].replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
      name in values ? String(values[name]) : match
    )
}
