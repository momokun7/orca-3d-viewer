import type { Messages } from '../messages.ts'

// Simplified Chinese UI text; see messages.ts for the English source.
export const ZH_HANS: Messages = {
  loading: '正在加载 3D 模型…',
  contextLost: '图形驱动程序重置了 3D 视图。驱动程序恢复后会重新显示；如果没有恢复，请重新打开文件。',
  parseFailed: '无法显示此 3D 模型。文件可能已损坏，或使用了查看器不支持的功能。',
  corrupt: '此模型已损坏：{{path}} {{reason}}。',
  corruptFile: '此 {{format}} 文件已损坏：{{reason}}。',
  parseTimeout: '此 3D 模型加载时间过长，已停止加载。',
  webglUnavailable:
    '此 3D 视图需要 WebGL，但当前不可用。可能已关闭图形加速，或 GPU 已停止响应。',
  renderFailed: '已读取模型，但无法绘制。',
  truncated:
    '此 GLB 文件不完整：文件头声明 {{declared}} 字节，实际只有 {{actual}} 字节。文件可能仍在下载或复制中，或传输已中断。',
  unsupportedExtensions: '此模型需要查看器不支持的 glTF 扩展：{{extensions}}。',
  tooLargeGeometry:
    '此模型过大，无法安全显示：解码后的顶点和动画数据将达到 {{value}}（上限为 {{limit}}）。',
  tooLargeGpu:
    '此模型过大，无法安全显示：其纹理和变形目标将占用 {{value}} GPU 内存（上限为 {{limit}}）。',
  tooManyNodes: '此模型过大，无法安全显示：包含 {{value}} 个节点（上限为 {{limit}} 个）。',
  tooManyDrawCalls:
    '此模型过大，无法安全显示：每帧需要 {{value}} 次绘制调用（上限为 {{limit}} 次）。',
  tooManyImages: '此模型过大，无法安全显示：包含 {{value}} 张图片（上限为 {{limit}} 张）。',
  tooManyDrawnVertices:
    '此模型过大，无法安全显示：每帧将绘制 {{value}} 个顶点（上限为 {{limit}} 个）。',
  tooManyMaterials: '此模型过大，无法安全显示：包含 {{value}} 个材质（上限为 {{limit}} 个）。',
  tooManyChannels: '此模型过大，无法安全显示：其动画包含 {{value}} 个通道（上限为 {{limit}} 个）。',
  tooComplex: '此模型过于复杂，无法在加载前完成检查，因此未打开。',
  tooManyTracks: '此模型过大，无法安全显示：其动画将生成 {{value}} 条轨道（上限为 {{limit}} 条）。',
  tooLargeTotal: '此模型过大，无法安全显示：总共将占用 {{value}} 内存（上限为 {{limit}}）。',
  tooLargeLoaded: '此模型实际大于文件中声明的大小（{{what}}），因此不予显示。',
  loadingNewer: '正在加载最新保存的内容…',
  tooManyTextures: '此模型过大，无法安全显示：包含 {{value}} 个纹理（上限为 {{limit}} 个）。',
  tooManyJoints: '此模型过大，无法安全显示：某个蒙皮包含 {{value}} 个关节（上限为 {{limit}} 个）。',
  imageTooLarge:
    '此模型过大，无法安全显示：有一张图片为 {{width}} × {{height}} 像素（上限为每边 {{limit}} 像素）。',
  unreadableImage:
    '图片 {{index}} 不是可在解码前检查尺寸的 PNG、JPEG、WebP、AVIF 或 KTX2 图片，因此未打开模型。',
  unreadableDraco: '网格 {{index}} 包含无法在解码前检查大小的 Draco 数据，因此未打开模型。',
  externalBuffers:
    '此模型的几何数据保存在单独的文件中（{{files}}），Orca 插件无法读取这些文件。请打开 .glb 文件，或已嵌入数据的 .gltf 文件。',
  externalImages:
    '单独文件中的纹理（{{files}}）不会显示：Orca 插件无法读取模型旁边的文件。请使用 .glb 文件查看这些纹理。',
  externalTextures:
    '单独文件中的纹理（{{files}}）不会显示：Orca 插件无法读取模型旁边的文件。请将纹理嵌入文件中以查看。',
  objMaterials: '单独 .mtl 文件中的材质不会显示：Orca 插件无法读取模型旁边的文件。',
  assumedMeters: '此格式没有单位，因此尺寸以米为单位显示。',
  fbxText: '这是文本（ASCII）格式的 FBX 文件，查看器无法读取。请导出为二进制 FBX。',
  fbxVersion: '此 FBX 文件的版本为 {{version}}；查看器支持 FBX 7.0（2011）及更高版本。请使用较新的工具重新导出。',
  laterSaveFailed: '无法显示最新保存的内容，因此仍显示之前的内容：{{reason}}',
  moreFiles: '{{list}} 等另外 {{count}} 个',
  otherScenes: { other: '此文件还有 {{count}} 个场景；当前显示默认场景。' },
  resetView: '重置视图',
  wireframe: '线框',
  wireframeTooLarge: '模型过大，无法使用线框',
  guides: '网格和坐标轴',
  darkTheme: '深色主题',
  details: '详情',
  detailsTitle: '用于问题报告的详情',
  detailsNote: '查看器和浏览器版本、图形信息、最近的加载记录以及所有错误。不包含模型数据，错误消息中引用的内容除外。',
  copyDetails: '复制',
  copied: '已复制',
  copyByHand: '无法在此处复制。请选中文本后复制。',
  close: '关闭',
  playAnimation: '播放动画',
  pauseAnimation: '暂停动画',
  animation: '动画',
  animationFallback: '动画 {{index}}',
  allClips: '所有片段',
  vertices: { other: '{{count}} 个顶点' },
  triangles: { other: '{{count}} 个三角形' },
  points: { other: '{{count}} 个点' },
  lineSegments: { other: '{{count}} 条线段' },
  dimensionsTitle: '宽 × 高 × 深',
  dimensions: '{{width}} × {{height}} × {{depth}} {{unit}}',
  gridCell: '网格 {{size}}',
  viewportLabel: '3D 模型：{{summary}}'
}
