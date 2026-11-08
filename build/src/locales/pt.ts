import type { Messages } from '../messages.ts'

// Brazilian Portuguese UI text; see messages.ts for the English source.
export const PT: Messages = {
  loading: 'Carregando modelo 3D…',
  contextLost:
    'O driver de vídeo reiniciou a visualização 3D. Ela volta assim que o driver se recuperar; se não voltar, reabra o arquivo.',
  parseFailed:
    'Não foi possível exibir este modelo 3D. Talvez o arquivo esteja corrompido ou use um recurso que o visualizador não suporta.',
  corrupt: 'Este modelo está corrompido: {{path}} {{reason}}.',
  corruptFile: 'Este arquivo {{format}} está corrompido: {{reason}}.',
  parseTimeout: 'O carregamento deste modelo 3D demorou demais e foi interrompido.',
  webglUnavailable:
    'A visualização 3D precisa de WebGL, que não está disponível no momento. A aceleração de hardware pode estar desativada ou a GPU pode ter parado de responder.',
  renderFailed: 'O modelo foi lido, mas não foi possível renderizá-lo.',
  truncated:
    'Este arquivo GLB está incompleto: tem {{actual}} dos {{declared}} bytes informados no cabeçalho. Talvez ele ainda esteja sendo baixado ou copiado, ou a transferência tenha sido interrompida.',
  unsupportedExtensions: 'Este modelo usa extensões do glTF que o visualizador não suporta: {{extensions}}.',
  tooLargeGeometry:
    'Este modelo é grande demais para ser exibido com segurança: depois de decodificados, os dados de vértices e animação ocupariam {{value}} (o limite é {{limit}}).',
  tooLargeGpu:
    'Este modelo é grande demais para ser exibido com segurança: as texturas e os morph targets ocupariam {{value}} da memória da GPU (o limite é {{limit}}).',
  tooManyNodes: 'Este modelo é grande demais para ser exibido com segurança: tem {{value}} nós (o limite é {{limit}}).',
  tooManyDrawCalls:
    'Este modelo é grande demais para ser exibido com segurança: exigiria {{value}} draw calls por quadro (o limite é {{limit}}).',
  tooManyImages: 'Este modelo é grande demais para ser exibido com segurança: tem {{value}} imagens (o limite é {{limit}}).',
  tooManyDrawnVertices:
    'Este modelo é grande demais para ser exibido com segurança: desenharia {{value}} vértices por quadro (o limite é {{limit}}).',
  tooManyMaterials:
    'Este modelo é grande demais para ser exibido com segurança: tem {{value}} materiais (o limite é {{limit}}).',
  tooManyChannels:
    'Este modelo é grande demais para ser exibido com segurança: as animações têm {{value}} canais (o limite é {{limit}}).',
  tooComplex: 'Este modelo é complexo demais para ser verificado antes do carregamento, por isso não foi aberto.',
  tooManyTracks:
    'Este modelo é grande demais para ser exibido com segurança: as animações geram {{value}} trilhas (o limite é {{limit}}).',
  tooLargeTotal:
    'Este modelo é grande demais para ser exibido com segurança: ocuparia {{value}} de memória no total (o limite é {{limit}}).',
  tooLargeLoaded: 'Ao carregar, este modelo ficou maior do que o arquivo informava ({{what}}), por isso não será exibido.',
  loadingNewer: 'Carregando a versão salva mais recente…',
  tooManyTextures:
    'Este modelo é grande demais para ser exibido com segurança: tem {{value}} texturas (o limite é {{limit}}).',
  tooManyJoints:
    'Este modelo é grande demais para ser exibido com segurança: uma skin tem {{value}} articulações (o limite é {{limit}}).',
  imageTooLarge:
    'Este modelo é grande demais para ser exibido com segurança: uma imagem tem {{width}} × {{height}} pixels (o limite é {{limit}} por lado).',
  unreadableImage:
    'A imagem {{index}} não é um PNG, JPEG, WebP, AVIF ou KTX2 cujo tamanho possa ser verificado antes da decodificação, por isso o modelo não foi aberto.',
  unreadableDraco:
    'A malha {{index}} contém dados Draco cujo tamanho não pode ser verificado antes da decodificação, por isso o modelo não foi aberto.',
  externalBuffers:
    'Este modelo guarda a geometria em arquivos separados ({{files}}), e os plugins do Orca não conseguem lê-los. Abra um .glb ou um .gltf com os dados incorporados.',
  externalImages:
    'As texturas em arquivos separados ({{files}}) não aparecem, porque os plugins do Orca não leem outros arquivos da pasta do modelo. Use um .glb para vê-las.',
  externalTextures:
    'As texturas em arquivos separados ({{files}}) não aparecem, porque os plugins do Orca não leem outros arquivos da pasta do modelo. Incorpore-as ao arquivo para vê-las.',
  objMaterials:
    'Os materiais do arquivo .mtl separado não aparecem, porque os plugins do Orca não leem outros arquivos da pasta do modelo.',
  assumedMeters: 'Este formato não guarda unidades, por isso os tamanhos são exibidos em metros.',
  fbxText: 'Este é um arquivo FBX em texto (ASCII), que o visualizador não lê. Exporte-o como FBX binário.',
  fbxVersion:
    'Este arquivo FBX é da versão {{version}}, mas o visualizador lê FBX 7.0 (2011) ou mais recente. Exporte-o de novo com uma ferramenta atual.',
  usdCompressed: 'Este pacote USDZ compacta os arquivos. O USDZ os guarda sem compactação, então o visualizador não o abre. Exporte-o de novo com uma ferramenta que grave USDZ.',
  usdAssumedCentimeters: 'Este arquivo USD não informa unidades, então os tamanhos são mostrados em centímetros, como o USD pressupõe.',
  usdExternalLayers: 'Partes em arquivos USD separados ({{files}}) não são exibidas: plugins do Orca não conseguem ler arquivos ao lado do modelo. Junte-as em um .usdz para vê-las.',
  usdExternalTextures: 'Texturas em arquivos separados ({{files}}) não são exibidas: plugins do Orca não conseguem ler arquivos ao lado do modelo. Junte-as em um .usdz para vê-las.',
  laterSaveFailed: 'Não foi possível exibir a versão salva mais recente, por isso a anterior continua na tela: {{reason}}',
  moreFiles: '{{list}} e mais {{count}}',
  otherScenes: {
    one: 'Este arquivo tem mais {{count}} cena; só a cena padrão é exibida.',
    many: 'Este arquivo tem mais {{count}} cenas; só a cena padrão é exibida.',
    other: 'Este arquivo tem mais {{count}} cenas; só a cena padrão é exibida.'
  },
  resetView: 'Redefinir exibição',
  wireframe: 'Wireframe',
  wireframeTooLarge: 'Wireframe indisponível para um modelo deste tamanho',
  guides: 'Grade e eixos',
  darkTheme: 'Tema escuro',
  details: 'Detalhes',
  detailsTitle: 'Detalhes para relatar um problema',
  detailsNote:
    'Versões do visualizador e do navegador, dados da placa de vídeo, carregamentos recentes e eventuais erros. Não inclui dados do modelo, exceto trechos citados em mensagens de erro.',
  copyDetails: 'Copiar',
  copied: 'Copiado',
  copyByHand: 'Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.',
  close: 'Fechar',
  playAnimation: 'Reproduzir animação',
  pauseAnimation: 'Pausar animação',
  animation: 'Animação',
  animationFallback: 'Animação {{index}}',
  allClips: 'Todos os clipes',
  vertices: { one: '{{count}} vértice', many: '{{count}} vértices', other: '{{count}} vértices' },
  triangles: { one: '{{count}} triângulo', many: '{{count}} triângulos', other: '{{count}} triângulos' },
  points: { one: '{{count}} ponto', many: '{{count}} pontos', other: '{{count}} pontos' },
  lineSegments: {
    one: '{{count}} segmento de linha',
    many: '{{count}} segmentos de linha',
    other: '{{count}} segmentos de linha'
  },
  dimensionsTitle: 'Largura × altura × profundidade',
  dimensions: '{{width}} × {{height}} × {{depth}} {{unit}}',
  gridCell: 'Grade {{size}}',
  viewportLabel: 'Modelo 3D: {{summary}}'
}
