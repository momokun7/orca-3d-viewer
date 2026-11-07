// Spanish UI text; see messages.ts for the English source.
import type { Messages } from '../messages.ts'

export const ES: Messages = {
  loading: 'Cargando modelo 3D…',
  contextLost:
    'El controlador gráfico restableció la vista 3D. Volverá cuando el controlador se recupere; si no, vuelve a abrir el archivo.',
  parseFailed: 'No se puede mostrar este modelo 3D. Puede estar dañado o usar una función que el visor no admite.',
  corrupt: 'Este modelo está dañado: {{path}} {{reason}}.',
  corruptFile: 'Este archivo {{format}} está dañado: {{reason}}.',
  parseTimeout: 'Este modelo 3D tardó demasiado en cargarse, así que se detuvo la carga.',
  webglUnavailable:
    'Esta vista 3D necesita WebGL, que no está disponible ahora. Puede que la aceleración gráfica esté desactivada o que la GPU haya dejado de responder.',
  renderFailed: 'El modelo se leyó, pero no se pudo dibujar.',
  truncated:
    'Este archivo GLB está incompleto: tiene {{actual}} de los {{declared}} bytes que declara su encabezado. Puede que aún se esté descargando o copiando, o que se haya interrumpido la transferencia.',
  unsupportedExtensions: 'Este modelo requiere extensiones de glTF que el visor no admite: {{extensions}}.',
  tooLargeGeometry:
    'Este modelo es demasiado grande para mostrarlo de forma segura: al decodificarse ocuparía {{value}} de datos de vértices y animación (el límite es {{limit}}).',
  tooLargeGpu:
    'Este modelo es demasiado grande para mostrarlo de forma segura: sus texturas y morph targets ocuparían {{value}} de memoria de GPU (el límite es {{limit}}).',
  tooManyNodes:
    'Este modelo es demasiado grande para mostrarlo de forma segura: tiene {{value}} nodos (el límite es {{limit}}).',
  tooManyDrawCalls:
    'Este modelo es demasiado grande para mostrarlo de forma segura: requeriría {{value}} llamadas de dibujo por fotograma (el límite es {{limit}}).',
  tooManyImages:
    'Este modelo es demasiado grande para mostrarlo de forma segura: tiene {{value}} imágenes (el límite es {{limit}}).',
  tooManyDrawnVertices:
    'Este modelo es demasiado grande para mostrarlo de forma segura: dibujaría {{value}} vértices por fotograma (el límite es {{limit}}).',
  tooManyMaterials:
    'Este modelo es demasiado grande para mostrarlo de forma segura: tiene {{value}} materiales (el límite es {{limit}}).',
  tooManyChannels:
    'Este modelo es demasiado grande para mostrarlo de forma segura: sus animaciones tienen {{value}} canales (el límite es {{limit}}).',
  tooComplex: 'Este modelo es demasiado complejo para comprobarlo antes de cargarlo, así que no se abrió.',
  tooManyTracks:
    'Este modelo es demasiado grande para mostrarlo de forma segura: sus animaciones generan {{value}} pistas (el límite es {{limit}}).',
  tooLargeTotal:
    'Este modelo es demasiado grande para mostrarlo de forma segura: ocuparía {{value}} de memoria en total (el límite es {{limit}}).',
  tooLargeLoaded:
    'Este modelo resultó ser más grande de lo que declaraba su archivo ({{what}}), así que no se muestra.',
  loadingNewer: 'Cargando el último guardado…',
  tooManyTextures:
    'Este modelo es demasiado grande para mostrarlo de forma segura: tiene {{value}} texturas (el límite es {{limit}}).',
  tooManyJoints:
    'Este modelo es demasiado grande para mostrarlo de forma segura: un skin tiene {{value}} articulaciones (el límite es {{limit}}).',
  imageTooLarge:
    'Este modelo es demasiado grande para mostrarlo de forma segura: una imagen mide {{width}} × {{height}} píxeles (el límite es {{limit}} por lado).',
  unreadableImage:
    'La imagen {{index}} no es una imagen PNG, JPEG, WebP, AVIF o KTX2 cuyo tamaño se pueda comprobar antes de decodificarla, así que no se abrió el modelo.',
  unreadableDraco:
    'La malla {{index}} contiene datos Draco cuyo tamaño no se puede comprobar antes de decodificarlos, así que no se abrió el modelo.',
  externalBuffers:
    'Este modelo guarda su geometría en archivos aparte ({{files}}), que los plugins de Orca no pueden leer. Abre un .glb o un .gltf con los datos incrustados.',
  externalImages:
    'Las texturas en archivos aparte ({{files}}) no se muestran: los plugins de Orca no pueden leer archivos junto al modelo. Usa un .glb para verlas.',
  externalTextures:
    'Las texturas en archivos aparte ({{files}}) no se muestran: los plugins de Orca no pueden leer archivos junto al modelo. Incrústalas en el archivo para verlas.',
  objMaterials:
    'Los materiales de un archivo .mtl aparte no se muestran: los plugins de Orca no pueden leer archivos junto al modelo.',
  assumedMeters: 'Este formato no tiene unidades, así que los tamaños se muestran en metros.',
  fbxText: 'Este es un archivo FBX de texto (ASCII), que el visor no lee. Expórtalo como FBX binario.',
  fbxVersion:
    'Este archivo FBX es de la versión {{version}}; el visor lee FBX 7.0 (2011) y posteriores. Vuelve a exportarlo con una herramienta reciente.',
  laterSaveFailed: 'No se pudo mostrar el último guardado, así que se mantiene el anterior: {{reason}}',
  moreFiles: '{{list}} y {{count}} más',
  otherScenes: {
    one: 'Este archivo tiene 1 escena más; se muestra la escena predeterminada.',
    many: 'Este archivo tiene {{count}} de escenas más; se muestra la escena predeterminada.',
    other: 'Este archivo tiene {{count}} escenas más; se muestra la escena predeterminada.'
  },
  resetView: 'Restablecer vista',
  wireframe: 'Alambre',
  wireframeTooLarge: 'El modo alambre no está disponible para un modelo tan grande',
  guides: 'Cuadrícula y ejes',
  darkTheme: 'Tema oscuro',
  details: 'Detalles',
  detailsTitle: 'Detalles para informar de un problema',
  detailsNote:
    'Las versiones del visor y del navegador, tus gráficos, las cargas recientes y los errores. No incluye datos del modelo, salvo lo que cite un mensaje de error.',
  copyDetails: 'Copiar',
  copied: 'Copiado',
  copyByHand: 'No se pudo copiar aquí. Selecciona el texto y cópialo.',
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
