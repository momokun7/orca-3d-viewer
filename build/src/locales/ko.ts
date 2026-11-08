import type { Messages } from '../messages.ts'

// Korean UI text; see messages.ts for the English source.
export const KO: Messages = {
  loading: '3D 모델 로드 중…',
  contextLost:
    '그래픽 드라이버가 3D 보기를 재설정했습니다. 드라이버가 복구되면 다시 표시되며, 그래도 표시되지 않으면 파일을 다시 열어 주세요.',
  parseFailed: '이 3D 모델을 표시할 수 없습니다. 파일이 손상되었거나 뷰어가 지원하지 않는 기능을 쓰는 모델일 수 있습니다.',
  corrupt: '모델이 손상되었습니다: {{path}} {{reason}}',
  corruptFile: '{{format}} 파일이 손상되었습니다: {{reason}}',
  parseTimeout: '3D 모델을 로드하는 데 시간이 너무 오래 걸려 로드를 중단했습니다.',
  webglUnavailable:
    '3D 보기에 필요한 WebGL을 지금 사용할 수 없습니다. 하드웨어 그래픽 가속이 꺼져 있거나 GPU가 응답하지 않는 상태일 수 있습니다.',
  renderFailed: '모델은 읽었지만 화면에 그리지 못했습니다.',
  truncated:
    'GLB 파일이 중간에 잘려 있습니다. 헤더에는 {{declared}}바이트로 되어 있지만 실제로는 {{actual}}바이트뿐입니다. 아직 다운로드나 복사가 진행 중이거나 전송이 중간에 끊겼을 수 있습니다.',
  unsupportedExtensions: '이 모델에는 뷰어가 지원하지 않는 glTF 확장이 필요합니다: {{extensions}}',
  tooLargeGeometry:
    '모델이 너무 커서 안전하게 표시할 수 없습니다. 디코딩하면 정점 및 애니메이션 데이터가 {{value}}에 달합니다(한도: {{limit}}).',
  tooLargeGpu:
    '모델이 너무 커서 안전하게 표시할 수 없습니다. 텍스처와 모프 타깃에 GPU 메모리가 {{value}} 필요합니다(한도: {{limit}}).',
  tooManyNodes: '모델이 너무 커서 안전하게 표시할 수 없습니다. 노드 수: {{value}}개(한도: {{limit}}개).',
  tooManyDrawCalls:
    '모델이 너무 커서 안전하게 표시할 수 없습니다. 프레임당 드로 콜 수: {{value}}회(한도: {{limit}}회).',
  tooManyImages: '모델이 너무 커서 안전하게 표시할 수 없습니다. 이미지 수: {{value}}개(한도: {{limit}}개).',
  tooManyDrawnVertices:
    '모델이 너무 커서 안전하게 표시할 수 없습니다. 프레임당 그리는 정점 수: {{value}}개(한도: {{limit}}개).',
  tooManyMaterials: '모델이 너무 커서 안전하게 표시할 수 없습니다. 머티리얼 수: {{value}}개(한도: {{limit}}개).',
  tooManyChannels:
    '모델이 너무 커서 안전하게 표시할 수 없습니다. 애니메이션 채널 수: {{value}}개(한도: {{limit}}개).',
  tooComplex: '모델이 너무 복잡해서 로드하기 전에 검사할 수 없으므로 열지 않았습니다.',
  tooManyTracks:
    '모델이 너무 커서 안전하게 표시할 수 없습니다. 애니메이션 트랙 수: {{value}}개(한도: {{limit}}개).',
  tooLargeTotal: '모델이 너무 커서 안전하게 표시할 수 없습니다. 전체 메모리 사용량: {{value}}(한도: {{limit}}).',
  tooLargeLoaded: '로드해 보니 모델이 파일에 선언된 크기보다 커서({{what}}) 표시하지 않습니다.',
  loadingNewer: '최신 저장 내용 로드 중…',
  tooManyTextures: '모델이 너무 커서 안전하게 표시할 수 없습니다. 텍스처 수: {{value}}개(한도: {{limit}}개).',
  tooManyJoints: '모델이 너무 커서 안전하게 표시할 수 없습니다. 스킨 하나의 조인트 수: {{value}}개(한도: {{limit}}개).',
  imageTooLarge:
    '모델이 너무 커서 안전하게 표시할 수 없습니다. 크기가 {{width}} × {{height}}픽셀인 이미지가 있습니다(한도: 한 변 {{limit}}픽셀).',
  unreadableImage:
    '이미지 {{index}}번이 디코딩 전에 크기를 확인할 수 있는 형식(PNG, JPEG, WebP, AVIF, KTX2)이 아니어서 모델을 열지 않았습니다.',
  unreadableDraco: '메시 {{index}}번의 Draco 데이터는 디코딩 전에 크기를 확인할 수 없어 모델을 열지 않았습니다.',
  externalBuffers:
    '이 모델은 지오메트리가 별도 파일({{files}})에 들어 있는데, Orca 플러그인은 이런 파일을 읽을 수 없습니다. .glb 파일이나 데이터를 내장한 .gltf 파일을 열어 주세요.',
  externalImages:
    '별도 파일({{files}})로 된 텍스처는 표시되지 않습니다. Orca 플러그인은 모델과 같은 폴더의 다른 파일을 읽을 수 없습니다. 텍스처까지 보려면 .glb 파일을 사용하세요.',
  externalTextures:
    '별도 파일({{files}})로 된 텍스처는 표시되지 않습니다. Orca 플러그인은 모델과 같은 폴더의 다른 파일을 읽을 수 없습니다. 텍스처까지 보려면 파일에 내장하세요.',
  objMaterials: '별도 .mtl 파일의 머티리얼은 표시되지 않습니다. Orca 플러그인은 모델과 같은 폴더의 다른 파일을 읽을 수 없습니다.',
  assumedMeters: '이 형식에는 단위 정보가 없어 크기를 미터로 간주해 표시합니다.',
  fbxText: '텍스트(ASCII) 형식의 FBX 파일은 읽을 수 없습니다. 바이너리 FBX로 다시 내보내세요.',
  fbxVersion:
    '이 FBX 파일은 버전 {{version}}입니다. 뷰어는 FBX 7.0(2011) 이상만 읽을 수 있습니다. 최신 도구로 다시 내보내세요.',
  usdBinary: '바이너리(USDC) 형식의 USD 파일은 아직 읽을 수 없습니다. USDA 또는 USDA를 담은 USDZ로 내보내세요.',
  usdCompressed: '이 USDZ 패키지는 파일을 압축해 두었습니다. USDZ는 파일을 압축하지 않고 저장하므로 뷰어에서 열지 않습니다. USDZ를 지원하는 도구로 다시 내보내세요.',
  usdAssumedCentimeters: '이 USD 파일에는 단위가 없어, USD의 규칙대로 센티미터로 간주해 크기를 표시합니다.',
  usdExternalLayers: '별도 USD 파일({{files}})에 있는 부분은 표시되지 않습니다. Orca 플러그인은 모델과 같은 폴더의 다른 파일을 읽을 수 없습니다. .usdz로 묶으면 표시됩니다.',
  laterSaveFailed: '최신 저장 내용을 표시하지 못해 이전 내용을 그대로 표시합니다: {{reason}}',
  moreFiles: '{{list}} 외 {{count}}개',
  otherScenes: { other: '이 파일에는 장면이 {{count}}개 더 있습니다. 기본 장면을 표시합니다.' },
  resetView: '보기 초기화',
  wireframe: '와이어프레임',
  wireframeTooLarge: '모델이 너무 커서 와이어프레임을 사용할 수 없습니다',
  guides: '그리드 및 축',
  darkTheme: '다크 테마',
  details: '세부 정보',
  detailsTitle: '이슈 보고용 세부 정보',
  detailsNote:
    '뷰어와 브라우저 버전, 그래픽 정보, 최근 로드 기록, 발생한 오류가 들어 있습니다. 오류 메시지에 인용된 부분을 빼면 모델 데이터는 포함되지 않습니다.',
  copyDetails: '복사',
  copied: '복사됨',
  copyByHand: '여기서는 복사하지 못했습니다. 텍스트를 직접 선택해서 복사하세요.',
  close: '닫기',
  playAnimation: '애니메이션 재생',
  pauseAnimation: '애니메이션 일시 중지',
  animation: '애니메이션',
  animationFallback: '애니메이션 {{index}}',
  allClips: '모든 클립',
  vertices: { other: '정점 {{count}}개' },
  triangles: { other: '삼각형 {{count}}개' },
  points: { other: '점 {{count}}개' },
  lineSegments: { other: '선분 {{count}}개' },
  dimensionsTitle: '너비 × 높이 × 깊이',
  dimensions: '{{width}} × {{height}} × {{depth}} {{unit}}',
  gridCell: '그리드 {{size}}',
  viewportLabel: '3D 모델: {{summary}}'
}
