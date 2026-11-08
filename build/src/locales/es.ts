// Spanish UI text; see messages.ts for the English source.
import type { Messages } from '../messages.ts'

export const ES: Messages = {
  loading: 'Cargando el modelo 3D…',
  contextLost:
    'El controlador gráfico reinició la vista 3D. Volverá a verse cuando el controlador se recupere; si no, vuelve a abrir el archivo.',
  parseFailed: 'No se puede mostrar este modelo 3D. Puede que esté dañado o que use una función que el visor no admite.',
  corrupt: 'El modelo está dañado: {{path}} {{reason}}.',
  corruptFile: 'El archivo {{format}} está dañado: {{reason}}.',
  parseTimeout: 'La carga de este modelo 3D tardaba demasiado y se detuvo.',
  webglUnavailable:
    'La vista 3D necesita WebGL, que no está disponible en este momento. Puede que la aceleración por hardware esté desactivada o que la GPU haya dejado de responder.',
  renderFailed: 'El modelo se leyó, pero no se pudo dibujar.',
  truncated:
    'El archivo GLB está incompleto: tiene {{actual}} de los {{declared}} bytes que indica su encabezado. Puede que todavía se esté descargando o copiando, o que la transferencia se haya interrumpido.',
  unsupportedExtensions: 'El modelo requiere extensiones de glTF que el visor no admite: {{extensions}}.',
  tooLargeGeometry:
    'El modelo es demasiado grande para mostrarlo con seguridad: una vez decodificado, ocuparía {{value}} de datos de vértices y animación (el límite es {{limit}}).',
  tooLargeGpu:
    'El modelo es demasiado grande para mostrarlo con seguridad: sus texturas y morph targets ocuparían {{value}} de memoria de GPU (el límite es {{limit}}).',
  tooManyNodes:
    'El modelo es demasiado grande para mostrarlo con seguridad: tiene {{value}} nodos (el límite es {{limit}}).',
  tooManyDrawCalls:
    'El modelo es demasiado grande para mostrarlo con seguridad: necesitaría {{value}} llamadas de dibujo por fotograma (el límite es {{limit}}).',
  tooManyImages:
    'El modelo es demasiado grande para mostrarlo con seguridad: tiene {{value}} imágenes (el límite es {{limit}}).',
  tooManyDrawnVertices:
    'El modelo es demasiado grande para mostrarlo con seguridad: dibujaría {{value}} vértices por fotograma (el límite es {{limit}}).',
  tooManyMaterials:
    'El modelo es demasiado grande para mostrarlo con seguridad: tiene {{value}} materiales (el límite es {{limit}}).',
  tooManyChannels:
    'El modelo es demasiado grande para mostrarlo con seguridad: sus animaciones tienen {{value}} canales (el límite es {{limit}}).',
  tooComplex: 'El modelo es demasiado complejo para comprobarlo antes de cargarlo, así que no se abrió.',
  tooManyTracks:
    'El modelo es demasiado grande para mostrarlo con seguridad: sus animaciones generan {{value}} pistas (el límite es {{limit}}).',
  tooLargeTotal:
    'El modelo es demasiado grande para mostrarlo con seguridad: ocuparía {{value}} de memoria en total (el límite es {{limit}}).',
  tooLargeLoaded:
    'El modelo resultó ser más grande de lo que indicaba su archivo ({{what}}), así que no se muestra.',
  loadingNewer: 'Cargando la última versión guardada…',
  tooManyTextures:
    'El modelo es demasiado grande para mostrarlo con seguridad: tiene {{value}} texturas (el límite es {{limit}}).',
  tooManyJoints:
    'El modelo es demasiado grande para mostrarlo con seguridad: un skin tiene {{value}} articulaciones (el límite es {{limit}}).',
  imageTooLarge:
    'El modelo es demasiado grande para mostrarlo con seguridad: una imagen mide {{width}} × {{height}} píxeles (el límite es {{limit}} por lado).',
  unreadableImage:
    'No se abrió el modelo: la imagen {{index}} no es un PNG, JPEG, WebP, AVIF o KTX2 cuyo tamaño pueda comprobarse antes de decodificarla.',
  unreadableDraco:
    'No se abrió el modelo: la malla {{index}} contiene datos Draco cuyo tamaño no puede comprobarse antes de decodificarlos.',
  externalBuffers:
    'El modelo guarda su geometría en archivos aparte ({{files}}) y los plugins de Orca no pueden leerlos. Abre un .glb o un .gltf con los datos incrustados.',
  externalImages:
    'No se muestran las texturas guardadas en archivos aparte ({{files}}), porque los plugins de Orca no pueden leer otros archivos de la carpeta. Usa un .glb para verlas.',
  externalTextures:
    'No se muestran las texturas guardadas en archivos aparte ({{files}}), porque los plugins de Orca no pueden leer otros archivos de la carpeta. Incrústalas en el archivo para verlas.',
  objMaterials:
    'No se muestran los materiales del archivo .mtl, porque los plugins de Orca no pueden leer otros archivos de la carpeta.',
  assumedMeters: 'Este formato no guarda unidades, así que las medidas se muestran en metros.',
  fbxText: 'Es un archivo FBX de texto (ASCII) y el visor no puede leerlo. Vuelve a exportarlo como FBX binario.',
  fbxVersion:
    'El archivo es FBX {{version}} y el visor solo lee FBX 7.0 (2011) o posterior. Vuelve a exportarlo con una herramienta reciente.',
  usdCompressed: 'Este paquete USDZ comprime sus archivos. USDZ los guarda sin comprimir, así que el visor no lo abre. Vuelve a exportarlo con una herramienta que escriba USDZ.',
  usdAssumedCentimeters: 'Este archivo USD no indica unidades, así que las medidas se muestran en centímetros, como supone USD.',
  usdExternalLayers: 'Las partes que están en archivos USD aparte ({{files}}) no se muestran: los plugins de Orca no pueden leer archivos junto al modelo. Empaquétalas en un .usdz para verlas.',
  usdExternalTextures: 'Las texturas que están en archivos aparte ({{files}}) no se muestran: los plugins de Orca no pueden leer archivos junto al modelo. Empaquétalas en un .usdz para verlas.',
  laterSaveFailed: 'No se pudo mostrar la última versión guardada; se mantiene la anterior: {{reason}}',
  moreFiles: '{{list}} y {{count}} más',
  otherScenes: {
    one: 'El archivo tiene 1 escena más; se muestra la escena predeterminada.',
    many: 'El archivo tiene {{count}} de escenas más; se muestra la escena predeterminada.',
    other: 'El archivo tiene {{count}} escenas más; se muestra la escena predeterminada.'
  },
  resetView: 'Restablecer vista',
  wireframe: 'Alambre',
  wireframeTooLarge: 'El modo alambre no está disponible en modelos tan grandes',
  guides: 'Cuadrícula y ejes',
  darkTheme: 'Tema oscuro',
  details: 'Detalles',
  detailsTitle: 'Detalles para informar de un problema',
  detailsNote:
    'Versiones del visor y del navegador, tu GPU, las últimas cargas y los errores. No incluye datos del modelo, salvo lo que cite algún mensaje de error.',
  copyDetails: 'Copiar',
  copied: 'Copiado',
  copyByHand: 'No se pudo copiar automáticamente. Selecciona el texto y cópialo a mano.',
  close: 'Cerrar',
  playAnimation: 'Reproducir animación',
  pauseAnimation: 'Pausar animación',
  animation: 'Animación',
  animationFallback: 'Animación {{index}}',
  allClips: 'Todos los clips',
  vertices: { one: '{{count}} vértice', many: '{{count}} de vértices', other: '{{count}} vértices' },
  triangles: { one: '{{count}} triángulo', many: '{{count}} de triángulos', other: '{{count}} triángulos' },
  points: { one: '{{count}} punto', many: '{{count}} de puntos', other: '{{count}} puntos' },
  lineSegments: { one: '{{count}} segmento', many: '{{count}} de segmentos', other: '{{count}} segmentos' },
  dimensionsTitle: 'Ancho × alto × profundidad',
  dimensions: '{{width}} × {{height}} × {{depth}} {{unit}}',
  gridCell: 'Cuadrícula {{size}}',
  viewportLabel: 'Modelo 3D: {{summary}}'
}
