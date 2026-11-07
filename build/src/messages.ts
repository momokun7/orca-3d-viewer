// UI text in English and Japanese here, and in the other languages Orca offers under locales/. A
// message may be a string, or plural forms keyed by Intl.PluralRules categories ('one', 'few',
// 'other', …) and chosen by the `count` value.
import { DE } from './locales/de.ts'
import { ES } from './locales/es.ts'
import { FR } from './locales/fr.ts'
import { KO } from './locales/ko.ts'
import { PT } from './locales/pt.ts'
import { RU } from './locales/ru.ts'
import { TR } from './locales/tr.ts'
import { ZH_HANS } from './locales/zh-hans.ts'
import { ZH_HANT } from './locales/zh-hant.ts'

export type Message = string | { zero?: string; one?: string; two?: string; few?: string; many?: string; other: string }
export type Messages = Record<MessageKey, Message>

const EN = {
  loading: 'Loading 3D model…',
  contextLost:
    'The 3D view was reset by the graphics driver. It comes back once the driver recovers; if it does not, reopen the file.',
  parseFailed: 'Unable to display this 3D model. It may be corrupt, or use a feature the viewer does not support.',
  corrupt: 'This model is corrupt: {{path}} {{reason}}.',
  corruptFile: 'This {{format}} file is corrupt: {{reason}}.',
  parseTimeout: 'This 3D model took too long to load, so loading was stopped.',
  webglUnavailable:
    'This 3D view needs WebGL, which is not available right now. Graphics acceleration may be turned off or the GPU may have stopped responding.',
  renderFailed: 'The model was read, but it could not be drawn.',
  truncated:
    'This GLB file is cut short: it has {{actual}} of the {{declared}} bytes its header declares. It may still be downloading or copying, or the transfer was interrupted.',
  unsupportedExtensions: 'This model requires glTF extensions the viewer does not support: {{extensions}}.',
  tooLargeGeometry:
    'This model is too large to display safely: it would decode to {{value}} of vertex and animation data (the limit is {{limit}}).',
  tooLargeGpu:
    'This model is too large to display safely: its textures and morph targets would take {{value}} of GPU memory (the limit is {{limit}}).',
  tooManyNodes: 'This model is too large to display safely: it has {{value}} nodes (the limit is {{limit}}).',
  tooManyDrawCalls:
    'This model is too large to display safely: it would take {{value}} draw calls per frame (the limit is {{limit}}).',
  tooManyImages: 'This model is too large to display safely: it has {{value}} images (the limit is {{limit}}).',
  tooManyDrawnVertices:
    'This model is too large to display safely: it would draw {{value}} vertices per frame (the limit is {{limit}}).',
  tooManyMaterials: 'This model is too large to display safely: it has {{value}} materials (the limit is {{limit}}).',
  tooManyChannels: 'This model is too large to display safely: its animations have {{value}} channels (the limit is {{limit}}).',
  tooComplex: 'This model is too complex to check before loading, so it was not opened.',
  tooManyTracks: 'This model is too large to display safely: its animations build {{value}} tracks (the limit is {{limit}}).',
  tooLargeTotal: 'This model is too large to display safely: it would take {{value}} of memory in all (the limit is {{limit}}).',
  tooLargeLoaded: 'This model turned out larger than its file declared ({{what}}), so it is not shown.',
  loadingNewer: 'Loading the latest save…',
  tooManyTextures: 'This model is too large to display safely: it has {{value}} textures (the limit is {{limit}}).',
  tooManyJoints: 'This model is too large to display safely: a skin has {{value}} joints (the limit is {{limit}}).',
  imageTooLarge:
    'This model is too large to display safely: an image is {{width}} × {{height}} pixels (the limit is {{limit}} per side).',
  unreadableImage:
    'Image {{index}} is not a PNG, JPEG, WebP, AVIF or KTX2 image whose size can be checked before decoding, so the model was not opened.',
  unreadableDraco: 'Mesh {{index}} holds Draco data whose size cannot be checked before decoding, so the model was not opened.',
  externalBuffers:
    'This model keeps its geometry in separate files ({{files}}), which Orca plugins cannot read. Open a .glb, or a .gltf with its data embedded.',
  externalImages:
    'Textures in separate files ({{files}}) are not shown: Orca plugins cannot read files beside the model. Use a .glb to see them.',
  externalTextures:
    'Textures in separate files ({{files}}) are not shown: Orca plugins cannot read files beside the model. Embed them in the file to see them.',
  objMaterials: 'Materials in a separate .mtl file are not shown: Orca plugins cannot read files beside the model.',
  assumedMeters: 'This format has no units, so sizes are shown in meters.',
  fbxText: 'This is a text (ASCII) FBX file, which the viewer does not read. Export it as binary FBX.',
  fbxVersion: 'This FBX file is version {{version}}; the viewer reads FBX 7.0 (2011) and later. Export it again with a recent tool.',
  laterSaveFailed: 'The latest save could not be shown, so the previous one stays on screen: {{reason}}',
  moreFiles: '{{list}} and {{count}} more',
  otherScenes: { one: 'This file has 1 more scene; the default scene is shown.', other: 'This file has {{count}} more scenes; the default scene is shown.' },
  resetView: 'Reset view',
  wireframe: 'Wireframe',
  wireframeTooLarge: 'Wireframe is not available for a model this large',
  guides: 'Grid and axes',
  darkTheme: 'Dark theme',
  details: 'Details',
  detailsTitle: 'Details for an issue report',
  detailsNote: 'The viewer and browser versions, your graphics, recent loads and any errors. No model data, except what an error message quotes.',
  copyDetails: 'Copy',
  copied: 'Copied',
  copyByHand: 'Could not copy here. Select the text and copy it.',
  close: 'Close',
  playAnimation: 'Play animation',
  pauseAnimation: 'Pause animation',
  animation: 'Animation',
  animationFallback: 'Animation {{index}}',
  allClips: 'All clips',
  vertices: { one: '{{count}} vertex', other: '{{count}} vertices' },
  triangles: { one: '{{count}} triangle', other: '{{count}} triangles' },
  points: { one: '{{count}} point', other: '{{count}} points' },
  lineSegments: { one: '{{count}} line segment', other: '{{count}} line segments' },
  dimensionsTitle: 'Width × height × depth',
  dimensions: '{{width}} × {{height}} × {{depth}} {{unit}}',
  gridCell: 'Grid {{size}}',
  viewportLabel: '3D model: {{summary}}'
} satisfies Record<string, Message>

export type MessageKey = keyof typeof EN

const JA: Messages = {
  loading: '3D モデルを読み込み中…',
  contextLost:
    'グラフィックスドライバーによって 3D 表示がリセットされました。ドライバーが回復すれば元に戻ります。戻らない場合は、ファイルを開き直してください。',
  parseFailed: 'この 3D モデルを表示できません。ファイルが壊れているか、ビューアーが対応していない機能を使っている可能性があります。',
  corrupt: 'このモデルは壊れています: {{path}} {{reason}}',
  corruptFile: 'この {{format}} ファイルは壊れています: {{reason}}',
  parseTimeout: 'この 3D モデルは読み込みに時間がかかりすぎたため、中止しました。',
  webglUnavailable:
    '3D の表示には WebGL が必要ですが、現在使えません。ハードウェア アクセラレーション(グラフィックスの高速化)がオフになっているか、GPU が応答していない可能性があります。',
  renderFailed: 'モデルは読み込めましたが、描画できませんでした。',
  truncated:
    'この GLB ファイルは途中で切れています(ヘッダーでは {{declared}} バイトのはずが、{{actual}} バイトしかありません)。ダウンロードやコピーがまだ終わっていないか、途中で中断された可能性があります。',
  unsupportedExtensions: 'このモデルには、ビューアーが対応していない glTF 拡張機能が必要です: {{extensions}}',
  tooLargeGeometry:
    'このモデルは大きすぎるため、安全に表示できません。展開すると頂点やアニメーションのデータが {{value}} になります(上限は {{limit}})。',
  tooLargeGpu:
    'このモデルは大きすぎるため、安全に表示できません。テクスチャとモーフターゲットに GPU メモリが {{value}} 必要です(上限は {{limit}})。',
  tooManyNodes: 'このモデルは大きすぎるため、安全に表示できません。ノードが {{value}} 個あります(上限は {{limit}} 個)。',
  tooManyDrawCalls:
    'このモデルは大きすぎるため、安全に表示できません。1 フレームに {{value}} 回の描画が必要になります(上限は {{limit}} 回)。',
  tooManyImages: 'このモデルは大きすぎるため、安全に表示できません。画像が {{value}} 枚あります(上限は {{limit}} 枚)。',
  tooManyDrawnVertices:
    'このモデルは大きすぎるため、安全に表示できません。1 フレームに {{value}} 個の頂点を描くことになります(上限は {{limit}} 個)。',
  tooManyMaterials: 'このモデルは大きすぎるため、安全に表示できません。マテリアルが {{value}} 個あります(上限は {{limit}} 個)。',
  tooManyChannels: 'このモデルは大きすぎるため、安全に表示できません。アニメーションのチャンネルが {{value}} 個あります(上限は {{limit}} 個)。',
  tooComplex: 'このモデルは複雑すぎて、読み込む前の確認ができないため、開きませんでした。',
  tooManyTracks: 'このモデルは大きすぎるため、安全に表示できません。アニメーションのトラックが {{value}} 本になります(上限は {{limit}} 本)。',
  tooLargeTotal: 'このモデルは大きすぎるため、安全に表示できません。合計で {{value}} のメモリが必要です(上限は {{limit}})。',
  tooLargeLoaded: 'このモデルは、読み込んでみるとファイルに書かれた大きさを超えていたため({{what}})、表示しません。',
  loadingNewer: '最新の保存内容を読み込み中…',
  tooManyTextures: 'このモデルは大きすぎるため、安全に表示できません。テクスチャが {{value}} 個あります(上限は {{limit}} 個)。',
  tooManyJoints: 'このモデルは大きすぎるため、安全に表示できません。スキンのジョイントが {{value}} 個あります(上限は {{limit}} 個)。',
  imageTooLarge:
    'このモデルは大きすぎるため、安全に表示できません。{{width}} × {{height}} ピクセルの画像があります(上限は 1 辺 {{limit}} ピクセル)。',
  unreadableImage:
    '画像 {{index}} は、展開する前に大きさを確かめられる形式(PNG・JPEG・WebP・AVIF・KTX2)ではないため、モデルを開きませんでした。',
  unreadableDraco: 'メッシュ {{index}} の Draco データは、展開する前に大きさを確かめられないため、モデルを開きませんでした。',
  externalBuffers:
    'このモデルの形状データは別のファイル({{files}})にあり、Orca のプラグインからは読み込めません。.glb か、データを埋め込んだ .gltf を開いてください。',
  externalImages:
    '別のファイルにあるテクスチャ({{files}})は表示されません。Orca のプラグインからは、モデルと同じフォルダーにあるほかのファイルを読み込めないためです。.glb で書き出すと表示されます。',
  externalTextures:
    '別のファイルにあるテクスチャ({{files}})は表示されません。Orca のプラグインからは、モデルと同じフォルダーにあるほかのファイルを読み込めないためです。テクスチャをファイルに埋め込むと表示されます。',
  objMaterials: '別の .mtl ファイルにあるマテリアルは表示されません。Orca のプラグインからは、モデルと同じフォルダーにあるほかのファイルを読み込めないためです。',
  assumedMeters: 'この形式には単位の情報がないため、大きさはメートルとみなして表示しています。',
  fbxText: 'テキスト(ASCII)形式の FBX ファイルは読み込めません。バイナリ形式の FBX で書き出してください。',
  fbxVersion: 'この FBX ファイルはバージョン {{version}} です。読み込めるのは FBX 7.0(2011 年)以降です。新しいツールで書き出し直してください。',
  laterSaveFailed: '最新の保存内容を表示できなかったため、前の内容を表示しています: {{reason}}',
  moreFiles: '{{list}} ほか {{count}} 件',
  otherScenes: { other: 'このファイルにはシーンがほかに {{count}} 個あります。表示しているのは既定のシーンです。' },
  resetView: '視点をリセット',
  wireframe: 'ワイヤーフレーム',
  wireframeTooLarge: 'モデルが大きすぎるため、ワイヤーフレームは使えません',
  guides: 'グリッドと軸',
  darkTheme: 'ダークテーマ',
  details: '詳細',
  detailsTitle: 'Issue 報告用の詳細',
  detailsNote: 'ビューアーとブラウザのバージョン、グラフィックスの情報、最近の読み込み、発生したエラーをまとめています。モデルのデータは、エラーの文に引用された部分を除いて含みません。',
  copyDetails: 'コピー',
  copied: 'コピーしました',
  copyByHand: '自動でコピーできませんでした。テキストを選択して、手動でコピーしてください。',
  close: '閉じる',
  playAnimation: 'アニメーションを再生',
  pauseAnimation: 'アニメーションを一時停止',
  animation: 'アニメーション',
  animationFallback: 'アニメーション {{index}}',
  allClips: 'すべてのアニメーション',
  vertices: { other: '頂点 {{count}}' },
  triangles: { other: '三角形 {{count}}' },
  points: { other: '点 {{count}}' },
  lineSegments: { other: '線分 {{count}}' },
  dimensionsTitle: '幅 × 高さ × 奥行き',
  dimensions: '{{width}} × {{height}} × {{depth}} {{unit}}',
  gridCell: 'グリッド {{size}}',
  viewportLabel: '3D モデル: {{summary}}'
}

export type MessageValues = Record<string, string | number>
export type Translate = (key: MessageKey, values?: MessageValues, count?: number) => string

/**
 * A translator for `locale`. `count` picks a plural form; give the formatted number as the `count`
 * value too when the text shows it.
 */
const BY_LANGUAGE: Record<string, Messages> = { ja: JA, de: DE, es: ES, fr: FR, ko: KO, pt: PT, ru: RU, tr: TR }

/** The table for `locale`: by its language, and for Chinese by its script or region. */
export function messagesFor(locale: string): Messages {
  const tag = locale.toLowerCase()
  const language = tag.split('-')[0]
  if (language === 'zh') return /-(hant|tw|hk|mo)(-|$)/.test(tag) ? ZH_HANT : ZH_HANS
  return Object.hasOwn(BY_LANGUAGE, language) ? BY_LANGUAGE[language] : EN
}

export function createTranslate(locale: string): Translate {
  const table = messagesFor(locale)
  const plurals = new Intl.PluralRules(locale)
  return (key, values = {}, count) => {
    const message = table[key]
    const template =
      typeof message === 'string'
        ? message
        : ((message as Record<string, string | undefined>)[plurals.select(count ?? 0)] ?? message.other)
    return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
      Object.hasOwn(values, name) ? String(values[name]) : match
    )
  }
}
