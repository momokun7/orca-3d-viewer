const EN = {
  loading: 'Loading 3D model…',
  contextLost:
    'The 3D view was reset by the graphics driver. It comes back once the driver recovers; if it does not, reopen the file.',
  parseFailed:
    'Unable to display this 3D model. It may be corrupt or use an unsupported extension.',
  parseTimeout: 'This 3D model took too long to load, so loading was stopped.',
  webglUnavailable:
    'This 3D view needs WebGL, which is not available right now. Graphics acceleration may be turned off or the GPU may have stopped responding.',
  renderFailed: 'The model was read, but it could not be drawn.',
  truncated:
    'This GLB file is cut short: it has {{actual}} of the {{declared}} bytes its header declares. It may still be downloading or copying, or the transfer was interrupted.',
  unsupportedExtensions: 'This model requires glTF extensions the viewer does not support: {{extensions}}.',
  tooLargeAccessorBytes:
    'This model is too large to display safely: it declares {{value}} of vertex and animation data (the limit is {{limit}}).',
  tooManyNodes: 'This model is too large to display safely: it has {{value}} nodes (the limit is {{limit}}).',
  tooManyDrawCalls:
    'This model is too large to display safely: it would take {{value}} draw calls per frame (the limit is {{limit}}).',
  imageTooLarge:
    'This model is too large to display safely: an image is {{width}} × {{height}} pixels (the limit is {{limit}} per side).',
  tooManyImagePixels:
    'This model is too large to display safely: its images hold {{value}} pixels in all (the limit is {{limit}}).',
  accessorOutOfRange: 'This model is corrupt: accessor {{index}} reads past the end of its buffer view.',
  externalBuffers:
    'This model keeps its geometry in separate files ({{files}}), which Orca plugins cannot read. Open a .glb, or a .gltf with its data embedded.',
  externalImages:
    'Textures in separate files ({{files}}) are not shown: Orca plugins cannot read files beside the model. Use a .glb to see them.',
  moreFiles: '{{list}} and {{count}} more',
  otherScenes: 'This file has {{count}} more scene(s); the default scene is shown.',
  resetView: 'Reset view',
  wireframe: 'Wireframe',
  guides: 'Grid and axes',
  playAnimation: 'Play animation',
  pauseAnimation: 'Pause animation',
  animation: 'Animation',
  animationFallback: 'Animation {{index}}',
  allClips: 'All clips',
  stats: '{{vertices}} vertices · {{triangles}} triangles',
  statsPoints: '{{count}} points',
  statsLines: '{{count}} line segments',
  dimensionsTitle: 'Width × height × depth',
  dimensions: '{{width}} × {{height}} × {{depth}} {{unit}}',
  gridCell: 'Grid {{size}}',
  viewportLabel: '3D model: {{summary}}'
}

export type MessageKey = keyof typeof EN

const JA: Record<MessageKey, string> = {
  loading: '3D モデルを読み込み中…',
  contextLost:
    'グラフィックドライバーにより 3D 表示がリセットされました。ドライバーが回復すると元に戻ります。戻らない場合はファイルを開き直してください。',
  parseFailed:
    'この 3D モデルを表示できません。ファイルが壊れているか、未対応の拡張機能を使っている可能性があります。',
  parseTimeout: 'この 3D モデルは読み込みに時間がかかりすぎたため、読み込みを止めました。',
  webglUnavailable:
    'この 3D 表示には WebGL が必要ですが、今は使えません。グラフィックのハードウェアアクセラレーションが無効か、GPU が応答していない可能性があります。',
  renderFailed: 'モデルは読み込めましたが、描画できませんでした。',
  truncated:
    'この GLB ファイルは途中で切れています(ヘッダーにある {{declared}} バイトのうち {{actual}} バイトしかありません)。ダウンロードやコピーの途中か、転送が中断された可能性があります。',
  unsupportedExtensions: 'このモデルは、ビューアが対応していない glTF 拡張機能を必要としています: {{extensions}}',
  tooLargeAccessorBytes:
    'このモデルは大きすぎるため、安全に表示できません。頂点やアニメーションのデータが {{value}} あります(上限は {{limit}})。',
  tooManyNodes: 'このモデルは大きすぎるため、安全に表示できません。ノードが {{value}} 個あります(上限は {{limit}} 個)。',
  tooManyDrawCalls:
    'このモデルは大きすぎるため、安全に表示できません。1 フレームの描画が {{value}} 回になります(上限は {{limit}} 回)。',
  imageTooLarge:
    'このモデルは大きすぎるため、安全に表示できません。{{width}} × {{height}} ピクセルの画像があります(上限は 1 辺 {{limit}} ピクセル)。',
  tooManyImagePixels:
    'このモデルは大きすぎるため、安全に表示できません。画像が合わせて {{value}} ピクセルあります(上限は {{limit}} ピクセル)。',
  accessorOutOfRange: 'このモデルは壊れています。アクセサー {{index}} がバッファビューの範囲外を読もうとしています。',
  externalBuffers:
    'このモデルは形状データを別のファイル({{files}})に持っていますが、Orca のプラグインはそれを読み込めません。.glb か、データを埋め込んだ .gltf を開いてください。',
  externalImages:
    '別のファイルのテクスチャ({{files}})は表示されません。Orca のプラグインはモデルの隣にあるファイルを読み込めないためです。.glb にすると表示できます。',
  moreFiles: '{{list}} ほか {{count}} 件',
  otherScenes: 'このファイルにはほかに {{count}} 個のシーンがあります。既定のシーンを表示しています。',
  resetView: '視点をリセット',
  wireframe: 'ワイヤーフレーム',
  guides: 'グリッドと軸',
  playAnimation: 'アニメーションを再生',
  pauseAnimation: 'アニメーションを一時停止',
  animation: 'アニメーション',
  animationFallback: 'アニメーション {{index}}',
  allClips: 'すべてのクリップ',
  stats: '{{vertices}} 頂点 · {{triangles}} 三角形',
  statsPoints: '{{count}} 点',
  statsLines: '{{count}} 線分',
  dimensionsTitle: '幅 × 高さ × 奥行き',
  dimensions: '{{width}} × {{height}} × {{depth}} {{unit}}',
  gridCell: 'グリッド {{size}}',
  viewportLabel: '3D モデル: {{summary}}'
}

export type Translate = (key: MessageKey, values?: Record<string, string | number>) => string

export function createTranslate(locale: string): Translate {
  const table = locale.toLowerCase().startsWith('ja') ? JA : EN
  return (key, values = {}) =>
    table[key].replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
      Object.hasOwn(values, name) ? String(values[name]) : match
    )
}
