import type { Messages } from '../messages.ts'

// Simplified Chinese UI text; see messages.ts for the English source.
export const ZH_HANS: Messages = {
  loading: '正在加载 3D 模型…',
  contextLost: '显卡驱动重置了 3D 视图。驱动恢复后视图会自动重新显示；如果没有恢复，请重新打开文件。',
  parseFailed: '无法显示此 3D 模型。文件可能已损坏，或用到了查看器不支持的功能。',
  corrupt: '模型已损坏：{{path}} {{reason}}。',
  corruptFile: '{{format}} 文件已损坏：{{reason}}。',
  parseTimeout: '3D 模型加载超时，已停止加载。',
  webglUnavailable:
    '3D 视图需要 WebGL，但当前无法使用。可能是关闭了硬件加速，或 GPU 已停止响应。',
  renderFailed: '模型已读取，但无法渲染。',
  truncated:
    'GLB 文件不完整：文件头声明 {{declared}} 字节，实际只有 {{actual}} 字节。文件可能仍在下载或复制，也可能传输中断了。',
  unsupportedExtensions: '此模型用到了查看器不支持的 glTF 扩展：{{extensions}}。',
  tooLargeGeometry:
    '模型过大，无法安全显示：解码后的顶点和动画数据将达到 {{value}}（上限为 {{limit}}）。',
  tooLargeGpu:
    '模型过大，无法安全显示：纹理和变形目标将占用 {{value}} 显存（上限为 {{limit}}）。',
  tooManyNodes: '模型过大，无法安全显示：包含 {{value}} 个节点（上限为 {{limit}} 个）。',
  tooManyDrawCalls:
    '模型过大，无法安全显示：每帧需要 {{value}} 次绘制调用（上限为 {{limit}} 次）。',
  tooManyImages: '模型过大，无法安全显示：包含 {{value}} 张图片（上限为 {{limit}} 张）。',
  tooManyDrawnVertices:
    '模型过大，无法安全显示：每帧需要绘制 {{value}} 个顶点（上限为 {{limit}} 个）。',
  tooManyMaterials: '模型过大，无法安全显示：包含 {{value}} 个材质（上限为 {{limit}} 个）。',
  tooManyChannels: '模型过大，无法安全显示：动画包含 {{value}} 个通道（上限为 {{limit}} 个）。',
  tooComplex: '模型过于复杂，无法在加载前完成检查，因此没有打开。',
  tooManyTracks: '模型过大，无法安全显示：动画将生成 {{value}} 条轨道（上限为 {{limit}} 条）。',
  tooLargeTotal: '模型过大，无法安全显示：总共将占用 {{value}} 内存（上限为 {{limit}}）。',
  tooLargeLoaded: '模型加载后比文件中声明的更大（{{what}}），因此不予显示。',
  loadingNewer: '正在加载最新保存的版本…',
  tooManyTextures: '模型过大，无法安全显示：包含 {{value}} 张纹理（上限为 {{limit}} 张）。',
  tooManyJoints: '模型过大，无法安全显示：某个蒙皮包含 {{value}} 个关节（上限为 {{limit}} 个）。',
  imageTooLarge:
    '模型过大，无法安全显示：其中一张图片为 {{width}} × {{height}} 像素（每边上限为 {{limit}} 像素）。',
  unreadableImage:
    '图片 {{index}} 不是 PNG、JPEG、WebP、AVIF 或 KTX2 格式，无法在解码前检查尺寸，因此没有打开模型。',
  unreadableDraco: '网格 {{index}} 中的 Draco 数据无法在解码前检查大小，因此没有打开模型。',
  externalBuffers:
    '此模型的几何数据存放在单独的文件中（{{files}}），而 Orca 插件无法读取这些文件。请改为打开 .glb 文件，或内嵌数据的 .gltf 文件。',
  externalImages:
    '单独文件中的纹理（{{files}}）未能显示：Orca 插件无法读取模型所在文件夹中的其他文件。如需查看纹理，请改用 .glb 文件。',
  externalTextures:
    '单独文件中的纹理（{{files}}）未能显示：Orca 插件无法读取模型所在文件夹中的其他文件。如需查看纹理，请将其内嵌到模型文件中。',
  objMaterials: '单独 .mtl 文件中的材质未能显示：Orca 插件无法读取模型所在文件夹中的其他文件。',
  assumedMeters: '此格式不记录单位，尺寸按米显示。',
  fbxText: '这是文本（ASCII）格式的 FBX 文件，查看器无法读取。请导出为二进制 FBX。',
  fbxVersion: '此 FBX 文件的版本为 {{version}}，查看器仅支持 FBX 7.0（2011）及以上版本。请使用较新的工具重新导出。',
  laterSaveFailed: '无法显示最新保存的版本，当前仍显示上一个版本：{{reason}}',
  moreFiles: '{{list}}，另有 {{count}} 个',
  otherScenes: { other: '此文件还有另外 {{count}} 个场景，当前显示的是默认场景。' },
  resetView: '重置视图',
  wireframe: '线框',
  wireframeTooLarge: '模型过大，无法显示线框',
  guides: '网格和坐标轴',
  darkTheme: '深色主题',
  details: '详情',
  detailsTitle: '用于提交 Issue 的详情',
  detailsNote: '包括查看器和浏览器版本、显卡信息、最近的加载记录以及所有错误。不含模型数据，错误消息中引用的内容除外。',
  copyDetails: '复制',
  copied: '已复制',
  copyByHand: '无法在此处复制。请选中文本后手动复制。',
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
