import type { Messages } from '../messages.ts'

// Brazilian Portuguese UI text; see messages.ts for the English source.
export const PT: Messages = {
  loading: 'Carregando modelo 3D…',
  contextLost:
    'A visualização 3D foi redefinida pelo driver gráfico. Ela volta quando o driver se recuperar; se isso não acontecer, reabra o arquivo.',
  parseFailed:
    'Não foi possível exibir este modelo 3D. Ele pode estar corrompido ou usar um recurso que o visualizador não suporta.',
  corrupt: 'Este modelo está corrompido: {{path}} {{reason}}.',
  corruptFile: 'Este arquivo {{format}} está corrompido: {{reason}}.',
  parseTimeout: 'Este modelo 3D demorou demais para carregar, então o carregamento foi interrompido.',
  webglUnavailable:
    'Esta visualização 3D precisa de WebGL, que não está disponível agora. A aceleração gráfica pode estar desativada ou a GPU pode ter parado de responder.',
  renderFailed: 'O modelo foi lido, mas não pôde ser desenhado.',
  truncated:
    'Este arquivo GLB está incompleto: tem {{actual}} dos {{declared}} bytes declarados no cabeçalho. Ele ainda pode estar sendo baixado ou copiado, ou a transferência foi interrompida.',
  unsupportedExtensions: 'Este modelo requer extensões glTF que o visualizador não suporta: {{extensions}}.',
  tooLargeGeometry:
    'Este modelo é grande demais para ser exibido com segurança: os dados de vértices e animação ocupariam {{value}} após a decodificação (o limite é {{limit}}).',
  tooLargeGpu:
    'Este modelo é grande demais para ser exibido com segurança: suas texturas e alvos de morph ocupariam {{value}} de memória da GPU (o limite é {{limit}}).',
  tooManyNodes: 'Este modelo é grande demais para ser exibido com segurança: ele tem {{value}} nós (o limite é {{limit}}).',
  tooManyDrawCalls:
    'Este modelo é grande demais para ser exibido com segurança: ele exigiria {{value}} chamadas de desenho por quadro (o limite é {{limit}}).',
  tooManyImages: 'Este modelo é grande demais para ser exibido com segurança: ele tem {{value}} imagens (o limite é {{limit}}).',
  tooManyDrawnVertices:
    'Este modelo é grande demais para ser exibido com segurança: ele desenharia {{value}} vértices por quadro (o limite é {{limit}}).',
  tooManyMaterials:
    'Este modelo é grande demais para ser exibido com segurança: ele tem {{value}} materiais (o limite é {{limit}}).',
  tooManyChannels:
    'Este modelo é grande demais para ser exibido com segurança: suas animações têm {{value}} canais (o limite é {{limit}}).',
  tooComplex: 'Este modelo é complexo demais para ser verificado antes do carregamento, então não foi aberto.',
  tooManyTracks:
    'Este modelo é grande demais para ser exibido com segurança: suas animações geram {{value}} trilhas (o limite é {{limit}}).',
  tooLargeTotal:
    'Este modelo é grande demais para ser exibido com segurança: ele ocuparia {{value}} de memória no total (o limite é {{limit}}).',
  tooLargeLoaded: 'Este modelo ficou maior do que o arquivo declarava ({{what}}), então não é exibido.',
  loadingNewer: 'Carregando o salvamento mais recente…',
  tooManyTextures:
    'Este modelo é grande demais para ser exibido com segurança: ele tem {{value}} texturas (o limite é {{limit}}).',
  tooManyJoints:
    'Este modelo é grande demais para ser exibido com segurança: uma skin tem {{value}} juntas (o limite é {{limit}}).',
  imageTooLarge:
    'Este modelo é grande demais para ser exibido com segurança: uma imagem tem {{width}} × {{height}} pixels (o limite é {{limit}} por lado).',
  unreadableImage:
    'A imagem {{index}} não é uma imagem PNG, JPEG, WebP, AVIF ou KTX2 cujo tamanho possa ser verificado antes da decodificação, então o modelo não foi aberto.',
  unreadableDraco:
    'A malha {{index}} contém dados Draco cujo tamanho não pode ser verificado antes da decodificação, então o modelo não foi aberto.',
  externalBuffers:
    'Este modelo guarda a geometria em arquivos separados ({{files}}), que os plugins do Orca não conseguem ler. Abra um .glb ou um .gltf com os dados incorporados.',
  externalImages:
    'As texturas em arquivos separados ({{files}}) não são exibidas: os plugins do Orca não conseguem ler arquivos ao lado do modelo. Use um .glb para vê-las.',
  externalTextures:
    'As texturas em arquivos separados ({{files}}) não são exibidas: os plugins do Orca não conseguem ler arquivos ao lado do modelo. Incorpore-as ao arquivo para vê-las.',
  objMaterials:
    'Os materiais em um arquivo .mtl separado não são exibidos: os plugins do Orca não conseguem ler arquivos ao lado do modelo.',
  assumedMeters: 'Este formato não tem unidades, então os tamanhos são mostrados em metros.',
  fbxText: 'Este é um arquivo FBX de texto (ASCII), que o visualizador não lê. Exporte-o como FBX binário.',
  fbxVersion:
    'Este arquivo FBX é da versão {{version}}; o visualizador lê FBX 7.0 (2011) e posteriores. Exporte-o novamente com uma ferramenta recente.',
  laterSaveFailed: 'Não foi possível exibir o salvamento mais recente, então o anterior continua na tela: {{reason}}',
  moreFiles: '{{list}} e mais {{count}}',
  otherScenes: {
    one: 'Este arquivo tem mais {{count}} cena; a cena padrão é exibida.',
    many: 'Este arquivo tem mais {{count}} cenas; a cena padrão é exibida.',
    other: 'Este arquivo tem mais {{count}} cenas; a cena padrão é exibida.'
  },
  resetView: 'Redefinir exibição',
  wireframe: 'Aramado',
  wireframeTooLarge: 'O aramado não está disponível para um modelo tão grande',
  guides: 'Grade e eixos',
  darkTheme: 'Tema escuro',
  details: 'Detalhes',
  detailsTitle: 'Detalhes para relatar um problema',
  detailsNote:
    'As versões do visualizador e do navegador, seus gráficos, carregamentos recentes e eventuais erros. Nenhum dado do modelo, exceto o que uma mensagem de erro citar.',
  copyDetails: 'Copiar',
  copied: 'Copiado',
  copyByHand: 'Não foi possível copiar aqui. Selecione o texto e copie-o.',
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
