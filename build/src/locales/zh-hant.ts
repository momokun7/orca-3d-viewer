import type { Messages } from '../messages.ts'

// Traditional Chinese (Taiwan) UI text; see messages.ts for the English source.
export const ZH_HANT: Messages = {
  loading: '正在載入 3D 模型…',
  contextLost: '顯示卡驅動程式重設了 3D 檢視。驅動程式復原後會重新顯示；若未恢復，請重新開啟檔案。',
  parseFailed: '無法顯示此 3D 模型。檔案可能已損毀，或使用了檢視器不支援的功能。',
  corrupt: '此模型已損毀：{{path}} {{reason}}。',
  corruptFile: '此 {{format}} 檔案已損毀：{{reason}}。',
  parseTimeout: '此 3D 模型載入時間過長，已停止載入。',
  webglUnavailable:
    '此 3D 檢視需要 WebGL，但目前無法使用。可能已關閉圖形加速，或 GPU 已停止回應。',
  renderFailed: '已讀取模型，但無法繪製。',
  truncated:
    '此 GLB 檔案不完整：標頭宣告 {{declared}} 位元組，實際只有 {{actual}} 位元組。檔案可能仍在下載或複製中，或傳輸已中斷。',
  unsupportedExtensions: '此模型需要檢視器不支援的 glTF 擴充功能：{{extensions}}。',
  tooLargeGeometry:
    '此模型過大，無法安全顯示：解碼後的頂點與動畫資料將達到 {{value}}（上限為 {{limit}}）。',
  tooLargeGpu:
    '此模型過大，無法安全顯示：其紋理與變形目標將佔用 {{value}} GPU 記憶體（上限為 {{limit}}）。',
  tooManyNodes: '此模型過大，無法安全顯示：包含 {{value}} 個節點（上限為 {{limit}} 個）。',
  tooManyDrawCalls:
    '此模型過大，無法安全顯示：每個影格需要 {{value}} 次繪製呼叫（上限為 {{limit}} 次）。',
  tooManyImages: '此模型過大，無法安全顯示：包含 {{value}} 張圖片（上限為 {{limit}} 張）。',
  tooManyDrawnVertices:
    '此模型過大，無法安全顯示：每個影格將繪製 {{value}} 個頂點（上限為 {{limit}} 個）。',
  tooManyMaterials: '此模型過大，無法安全顯示：包含 {{value}} 個材質（上限為 {{limit}} 個）。',
  tooManyChannels: '此模型過大，無法安全顯示：其動畫包含 {{value}} 個通道（上限為 {{limit}} 個）。',
  tooComplex: '此模型過於複雜，無法在載入前完成檢查，因此未開啟。',
  tooManyTracks: '此模型過大，無法安全顯示：其動畫將產生 {{value}} 條軌道（上限為 {{limit}} 條）。',
  tooLargeTotal: '此模型過大，無法安全顯示：總共將佔用 {{value}} 記憶體（上限為 {{limit}}）。',
  tooLargeLoaded: '此模型實際大於檔案中宣告的大小（{{what}}），因此不予顯示。',
  loadingNewer: '正在載入最新儲存的內容…',
  tooManyTextures: '此模型過大，無法安全顯示：包含 {{value}} 個紋理（上限為 {{limit}} 個）。',
  tooManyJoints: '此模型過大，無法安全顯示：某個蒙皮包含 {{value}} 個關節（上限為 {{limit}} 個）。',
  imageTooLarge:
    '此模型過大，無法安全顯示：有一張圖片為 {{width}} × {{height}} 像素（上限為每邊 {{limit}} 像素）。',
  unreadableImage:
    '圖片 {{index}} 不是可在解碼前檢查尺寸的 PNG、JPEG、WebP、AVIF 或 KTX2 圖片，因此未開啟模型。',
  unreadableDraco: '網格 {{index}} 含有無法在解碼前檢查大小的 Draco 資料，因此未開啟模型。',
  externalBuffers:
    '此模型的幾何資料儲存在個別檔案中（{{files}}），Orca 外掛無法讀取這些檔案。請開啟 .glb 檔案，或已內嵌資料的 .gltf 檔案。',
  externalImages:
    '個別檔案中的紋理（{{files}}）不會顯示：Orca 外掛無法讀取模型旁的檔案。請使用 .glb 檔案來檢視這些紋理。',
  externalTextures:
    '個別檔案中的紋理（{{files}}）不會顯示：Orca 外掛無法讀取模型旁的檔案。請將紋理內嵌至檔案中以檢視。',
  objMaterials: '個別 .mtl 檔案中的材質不會顯示：Orca 外掛無法讀取模型旁的檔案。',
  assumedMeters: '此格式沒有單位，因此尺寸以公尺顯示。',
  fbxText: '這是文字（ASCII）格式的 FBX 檔案，檢視器無法讀取。請匯出為二進位 FBX。',
  fbxVersion: '此 FBX 檔案的版本為 {{version}}；檢視器支援 FBX 7.0（2011）及更新版本。請使用較新的工具重新匯出。',
  laterSaveFailed: '無法顯示最新儲存的內容，因此仍顯示先前的內容：{{reason}}',
  moreFiles: '{{list}} 等另外 {{count}} 個',
  otherScenes: { other: '此檔案還有 {{count}} 個場景；目前顯示預設場景。' },
  resetView: '重設檢視',
  wireframe: '線框',
  wireframeTooLarge: '模型過大，無法使用線框',
  guides: '網格與座標軸',
  darkTheme: '深色主題',
  details: '詳情',
  detailsTitle: '用於問題回報的詳情',
  detailsNote: '檢視器與瀏覽器版本、圖形資訊、最近的載入記錄以及所有錯誤。不含模型資料，錯誤訊息中引用的內容除外。',
  copyDetails: '複製',
  copied: '已複製',
  copyByHand: '無法在此複製。請選取文字後複製。',
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
