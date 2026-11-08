import type { Messages } from '../messages.ts'

// Traditional Chinese (Taiwan) UI text; see messages.ts for the English source.
export const ZH_HANT: Messages = {
  loading: '正在載入 3D 模型…',
  contextLost: '顯示卡驅動程式重設了 3D 檢視。驅動程式恢復後就會重新顯示；若未恢復，請重新開啟檔案。',
  parseFailed: '無法顯示此 3D 模型。檔案可能已損毀，或用到檢視器不支援的功能。',
  corrupt: '模型已損毀：{{path}} {{reason}}。',
  corruptFile: '{{format}} 檔案已損毀：{{reason}}。',
  parseTimeout: '3D 模型載入逾時，已停止載入。',
  webglUnavailable:
    '3D 檢視需要 WebGL，但目前無法使用。可能是硬體加速已關閉，或 GPU 已停止回應。',
  renderFailed: '已讀取模型，但無法繪製畫面。',
  truncated:
    'GLB 檔案不完整：標頭宣告 {{declared}} 位元組，實際只有 {{actual}} 位元組。檔案可能仍在下載或複製，也可能傳輸中斷了。',
  unsupportedExtensions: '此模型用到檢視器不支援的 glTF 擴充功能：{{extensions}}。',
  tooLargeGeometry:
    '模型過大，無法安全顯示：解碼後的頂點與動畫資料將達 {{value}}（上限為 {{limit}}）。',
  tooLargeGpu:
    '模型過大，無法安全顯示：紋理與變形目標將佔用 {{value}} 的 GPU 記憶體（上限為 {{limit}}）。',
  tooManyNodes: '模型過大，無法安全顯示：含有 {{value}} 個節點（上限為 {{limit}} 個）。',
  tooManyDrawCalls:
    '模型過大，無法安全顯示：每個影格需要 {{value}} 次繪製呼叫（上限為 {{limit}} 次）。',
  tooManyImages: '模型過大，無法安全顯示：含有 {{value}} 張圖片（上限為 {{limit}} 張）。',
  tooManyDrawnVertices:
    '模型過大，無法安全顯示：每個影格需要繪製 {{value}} 個頂點（上限為 {{limit}} 個）。',
  tooManyMaterials: '模型過大，無法安全顯示：含有 {{value}} 個材質（上限為 {{limit}} 個）。',
  tooManyChannels: '模型過大，無法安全顯示：動畫含有 {{value}} 個通道（上限為 {{limit}} 個）。',
  tooComplex: '模型過於複雜，無法在載入前完成檢查，因此沒有開啟。',
  tooManyTracks: '模型過大，無法安全顯示：動畫將產生 {{value}} 條軌道（上限為 {{limit}} 條）。',
  tooLargeTotal: '模型過大，無法安全顯示：總共將佔用 {{value}} 的記憶體（上限為 {{limit}}）。',
  tooLargeLoaded: '模型載入後比檔案中宣告的更大（{{what}}），因此不予顯示。',
  loadingNewer: '正在載入最新儲存的版本…',
  tooManyTextures: '模型過大，無法安全顯示：含有 {{value}} 張紋理（上限為 {{limit}} 張）。',
  tooManyJoints: '模型過大，無法安全顯示：某個蒙皮含有 {{value}} 個關節（上限為 {{limit}} 個）。',
  imageTooLarge:
    '模型過大，無法安全顯示：其中一張圖片為 {{width}} × {{height}} 像素（每邊上限為 {{limit}} 像素）。',
  unreadableImage:
    '圖片 {{index}} 不是 PNG、JPEG、WebP、AVIF 或 KTX2 格式，無法在解碼前檢查尺寸，因此沒有開啟模型。',
  unreadableDraco: '網格 {{index}} 中的 Draco 資料無法在解碼前檢查大小，因此沒有開啟模型。',
  externalBuffers:
    '此模型的幾何資料存放在獨立的檔案中（{{files}}），而 Orca 外掛無法讀取這些檔案。請改為開啟 .glb 檔，或內嵌資料的 .gltf 檔。',
  externalImages:
    '無法顯示獨立檔案中的紋理（{{files}}）：Orca 外掛無法讀取模型所在資料夾中的其他檔案。若要檢視紋理，請改用 .glb 檔。',
  externalTextures:
    '無法顯示獨立檔案中的紋理（{{files}}）：Orca 外掛無法讀取模型所在資料夾中的其他檔案。若要檢視紋理，請將紋理內嵌到模型檔案中。',
  objMaterials: '無法顯示獨立 .mtl 檔中的材質：Orca 外掛無法讀取模型所在資料夾中的其他檔案。',
  assumedMeters: '此格式不記錄單位，尺寸以公尺顯示。',
  fbxText: '這是文字（ASCII）格式的 FBX 檔案，檢視器無法讀取。請匯出為二進位 FBX。',
  fbxVersion: '此 FBX 檔案的版本為 {{version}}，檢視器僅支援 FBX 7.0（2011）以上版本。請用較新的工具重新匯出。',
  usdCompressed: '此 USDZ 套件壓縮了其中的檔案。USDZ 規定檔案以不壓縮的方式儲存，因此檢視器不會開啟。請使用可寫出 USDZ 的工具重新匯出。',
  usdAssumedCentimeters: '此 USD 檔案未註明單位，因此依照 USD 的慣例以公分顯示尺寸。',
  usdExternalLayers: '位於其他 USD 檔案（{{files}}）中的部分不會顯示：Orca 外掛無法讀取模型旁邊的檔案。將它們打包成 .usdz 即可顯示。',
  usdExternalTextures: '無法顯示獨立檔案中的紋理（{{files}}）：Orca 外掛無法讀取模型所在資料夾中的其他檔案。若要檢視紋理，請將它們打包成 .usdz。',
  laterSaveFailed: '無法顯示最新儲存的版本，目前仍顯示上一個版本：{{reason}}',
  moreFiles: '{{list}}，另有 {{count}} 個',
  otherScenes: { other: '此檔案還有另外 {{count}} 個場景，目前顯示的是預設場景。' },
  resetView: '重設檢視',
  wireframe: '線框',
  wireframeTooLarge: '模型過大，無法顯示線框',
  guides: '網格與座標軸',
  darkTheme: '深色主題',
  details: '詳情',
  detailsTitle: '用於回報 Issue 的詳情',
  detailsNote: '包括檢視器與瀏覽器版本、顯示卡資訊、最近的載入紀錄以及所有錯誤。不含模型資料，但錯誤訊息中引用的內容除外。',
  copyDetails: '複製',
  copied: '已複製',
  copyByHand: '無法在此複製。請選取文字後手動複製。',
  close: '關閉',
  playAnimation: '播放動畫',
  pauseAnimation: '暫停動畫',
  animation: '動畫',
  animationFallback: '動畫 {{index}}',
  allClips: '所有片段',
  vertices: { other: '{{count}} 個頂點' },
  triangles: { other: '{{count}} 個三角形' },
  points: { other: '{{count}} 個點' },
  lineSegments: { other: '{{count}} 條線段' },
  dimensionsTitle: '寬 × 高 × 深',
  dimensions: '{{width}} × {{height}} × {{depth}} {{unit}}',
  gridCell: '網格 {{size}}',
  viewportLabel: '3D 模型：{{summary}}'
}
