<div align="center">

[English](../../README.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · **Español** ·
[Français](README.fr.md) · [한국어](README.ko.md) · [Português](README.pt-BR.md) ·
[Русский](README.ru.md) · [Türkçe](README.tr.md) · [简体中文](README.zh-Hans.md) ·
[繁體中文](README.zh-Hant.md)

# 3D Viewer for Orca

**Mira modelos 3D sin salir del editor.**

Un visor de solo lectura para [Orca](https://github.com/stablyai/orca) que abre GLB, glTF, STL, PLY, OBJ y FBX.
Gira alrededor de un modelo, reproduce sus animaciones y comprueba de un vistazo si tiene el tamaño que crees.

[![CI](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/momokun7/orca-3d-viewer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![Orca](https://img.shields.io/badge/Orca-%E2%89%A5%201.4.248-black.svg)](https://github.com/stablyai/orca)
[![Permissions](https://img.shields.io/badge/permissions-none-brightgreen.svg)](#seguridad)

[Formatos](#formatos) · [Funciones](#funciones) · [Instalación](#instalación) · [Uso](#uso) ·
[Solución de problemas](#solución-de-problemas) · [Seguridad](#seguridad) · [Desarrollo](#desarrollo) ·
[Informar de un error](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml)

<img alt="El Stanford Bunny en 3D Viewer dentro de Orca, sobre una cuadrícula de suelo, con su tamaño, 156 × 154 × 121 mm, en la barra de estado" src="../images/hero.png" width="800">

</div>

## Formatos

Un visor, seis formatos.

<table>
  <tr>
    <td width="33%"><img alt="A Beautiful Game en GLB: un tablero de ajedrez de mármol con piezas de vidrio y metal" src="../images/formats/glb.png"></td>
    <td width="33%"><img alt="Corset en glTF con los datos incrustados: tela bordada y hebillas" src="../images/formats/gltf.png"></td>
    <td width="33%"><img alt="3DBenchy en STL: el barquito que se usa para probar impresoras 3D, en un naranja guardado en el archivo" src="../images/formats/stl.png"></td>
  </tr>
  <tr>
    <td align="center"><b>GLB</b>: A Beautiful Game</td>
    <td align="center"><b>glTF</b>: Corset</td>
    <td align="center"><b>STL</b>: 3DBenchy</td>
  </tr>
  <tr>
    <td width="33%"><img alt="El Stanford Armadillo en PLY: un escaneo 3D, en un verde guardado en sus vértices" src="../images/formats/ply.png"></td>
    <td width="33%"><img alt="La tetera de Utah en OBJ, en un morado guardado en sus vértices" src="../images/formats/obj.png"></td>
    <td width="33%"><img alt="BoomBox en FBX, con la textura de sus botones y rejillas de altavoz" src="../images/formats/fbx.png"></td>
  </tr>
  <tr>
    <td align="center"><b>PLY</b>: Stanford Armadillo</td>
    <td align="center"><b>OBJ</b>: Utah Teapot</td>
    <td align="center"><b>FBX</b>: BoomBox</td>
  </tr>
</table>

| Formato | Extensiones | Colores y texturas | Animación | Unidad de tamaño | Notas |
| --- | --- | --- | --- | --- | --- |
| glTF 2.0 | `.glb` `.gltf` | Sí | Sí | Metros (como define glTF) | Un `.gltf` debe incrustar sus datos |
| STL | `.stl` | Colores guardados en el archivo; si no, uno predeterminado | No | Milímetros (la convención de la impresión 3D), Z hacia arriba | Binario y texto |
| PLY | `.ply` | Colores de vértice; si no, uno predeterminado | No | Se muestra en metros | Binario y texto |
| OBJ | `.obj` | Colores de vértice (el `.mtl` no se puede leer) | No | Se muestra en metros | |
| FBX | `.fbx` | Solo texturas incrustadas | Sí | La unidad que indica el archivo | FBX binario 7.0 (2011) y posteriores |

También se abren los glTF comprimidos con Draco o Meshopt y las texturas KTX2 / Basis Universal.

## Funciones

### Mirar alrededor

<table>
  <tr>
    <td width="50%"><img alt="Arrastrar con el botón izquierdo del ratón hace girar la cámara alrededor del conejo" src="../images/features/orbit.gif"></td>
    <td width="50%"><img alt="Arrastrar con el botón derecho, y luego Shift más arrastrar con el izquierdo, desplaza la vista hacia los lados" src="../images/features/pan.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>Girar</b>: arrastrar</td>
    <td align="center"><b>Desplazar</b>: arrastrar con el botón derecho, o <kbd>Shift</kbd> + arrastrar</td>
  </tr>
  <tr>
    <td width="50%"><img alt="La rueda del ratón acerca el conejo y lo vuelve a alejar" src="../images/features/zoom.gif"></td>
    <td width="50%"><img alt="Una vista puesta del revés vuelve a la vista inicial con el botón de restablecer" src="../images/features/reset.gif"></td>
  </tr>
  <tr>
    <td align="center"><b>Zoom</b>: rueda del ratón</td>
    <td align="center"><b>Restablecer vista</b>: el primer botón de la barra de herramientas</td>
  </tr>
</table>

### Tamaño real

Una cuadrícula de suelo, los ejes X / Y / Z y el ancho × alto × profundidad del modelo, para que un modelo creado en la
unidad equivocada se note enseguida. El Stanford Bunny mide 15,6 cm de ancho.

<img alt="El conejo sobre una cuadrícula de 10 mm; la barra de estado indica 156 × 154 × 121 mm y luego Cuadrícula 10 mm" src="../images/features/size.gif" width="600">

### Alambre, cuadrícula y ejes

Muestra la malla solo con líneas, u oculta la cuadrícula y los ejes. El número de vértices y triángulos aparece en la barra de estado.

<img alt="El botón Alambre muestra la malla del conejo y luego el botón Cuadrícula y ejes oculta la cuadrícula del suelo" src="../images/features/inspect.gif" width="600">

### Animaciones

Reproduce y pausa, y elige un clip cuando el modelo tiene varios.

<img alt="Un zorro reproduce su clip Survey, cambia a Run desde el menú de clips, luego se pausa y vuelve a reproducirse" src="../images/features/animations.gif" width="600">

### Siempre al día

Guarda el archivo y la vista muestra la nueva versión, con la cámara donde estaba.

<img alt="Cada vez que se guarda el archivo con Ctrl + S, el conejo cambia de color sin moverse" src="../images/features/live.gif" width="600">

### Claro u oscuro

El visor se abre en claro; el botón de la luna en la barra de herramientas activa el **Tema oscuro** y lo desactiva. Recuerda
el tema, el modo alambre y la cuadrícula que elegiste por última vez, incluso después de reiniciar Orca (Orca 1.4.250 y posteriores).

<img alt="Al hacer clic en el botón de la luna de la barra de herramientas, el visor pasa a oscuro, y al volver a hacer clic pasa a claro" src="../images/features/theme.gif" width="600">

### Once idiomas

El texto del visor sigue el idioma de Orca: English, 日本語, Deutsch, Español, Français, 한국어, Português,
Русский, Türkçe, 简体中文 y 繁體中文.

### Detalles para pegar en un issue

El botón **i** de la barra de herramientas (en una pantalla de error, el botón **Detalles** bajo el mensaje) abre un resumen:
la versión del visor, tu navegador y tus gráficos, las cargas recientes con lo que tardaron y los errores encontrados.
Usa **Copiar** para pegarlo en un issue y explicará lo que pasó. No contiene datos del modelo.

<img alt="El panel Detalles: la versión del visor, el navegador, el historial de cargas y el motivo por el que se rechazó un archivo, con los botones Copiar y Cerrar" src="../images/details.png" width="600">

## Instalación

1. En Orca, abre **Ajustes → Plugins** y elige **Instalar plugin**.
2. En la pestaña **Git URL**, escribe:

   ```text
   https://github.com/momokun7/orca-3d-viewer#v1.0.0
   ```

3. Elige **Instalar**. El visor no pide ningún permiso, así que no hay nada más que conceder.

> [!IMPORTANT]
> Requiere la aplicación de escritorio de Orca, versión 1.4.248 o posterior.

## Uso

Abre un archivo en cualquiera de estos formatos y se mostrará en 3D. `.gltf` y `.obj` son archivos de texto, así que la
pestaña del editor cambia entre **Código fuente** (el texto) y **3D**.

| Acción | Cómo |
| --- | --- |
| Girar | Arrastrar |
| Desplazar | Arrastrar con el botón derecho, <kbd>Shift</kbd> + arrastrar, o las teclas de flecha |
| Zoom | Rueda del ratón |
| Restablecer vista | El primer botón de la barra de herramientas |
| Alambre, cuadrícula y ejes | Los botones de al lado |
| Claro u oscuro | El botón de la luna |
| Detalles | El botón **i** |
| Animaciones | El botón de reproducir y el menú de clips, cuando el modelo tiene alguno |

## Límites

> [!NOTE]
> Los plugins de Orca solo leen el archivo abierto, nunca los demás archivos de su carpeta, así que los datos guardados en
> archivos aparte no se pueden mostrar. Un `.gltf` cuya geometría está en un `.bin` aparte no se abre, y las texturas en archivos
> de imagen aparte y el `.mtl` de un OBJ se omiten. Un `.glb`, un `.gltf` con los datos incrustados o un FBX con las texturas
> incrustadas lo muestra todo.

- **Solo en la aplicación de escritorio.** En Orca en un navegador, el archivo se abre en Código fuente.
- **Hasta 64 MiB**, el límite de Orca para editores personalizados. Un modelo que al decodificarse ocuparía mucho más de lo que es seguro mantener,
  o que usa algo que el visor no puede leer, se rechaza con un mensaje que explica el motivo.
- **Nada de FBX antiguo ni de texto.** Vuelve a exportarlo como FBX binario 7.0 o posterior.

Se probaron los 152 modelos GLB y glTF incrustados de los
[glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) de Khronos: todos se abren, salvo
tres que necesitan una extensión que three.js no implementa.

## Solución de problemas

<details>
<summary>El archivo se abre como texto en lugar de en 3D</summary>

`.gltf` y `.obj` son archivos de texto, así que pueden abrirse en Código fuente (el texto). Elige **3D** en la pestaña del editor. En
Orca en un navegador, el 3D no está disponible.

</details>

<details>
<summary>Faltan texturas o colores</summary>

Un plugin no puede leer texturas en archivos de imagen aparte; la barra de estado indica los archivos que no pudo leer.
Para glTF, usa un `.glb`; para FBX, exporta con las texturas incrustadas. El `.mtl` de un OBJ no se puede leer, así que se muestra
con sus colores de vértice si los tiene y, si no, con un color predeterminado.

</details>

<details>
<summary>El tamaño parece incorrecto</summary>

STL se muestra en milímetros, y PLY y OBJ en metros, ya que ninguno de esos formatos guarda una unidad. FBX y glTF usan la
unidad que indica el archivo. Si el tamaño difiere en un factor de 1000 o 100, comprueba la unidad con la que se exportó el modelo.

</details>

<details>
<summary>Dice que el modelo no se puede abrir</summary>

El mensaje explica el motivo. Los modelos demasiado grandes, los archivos dañados y las funciones que el visor no
admite se rechazan antes de abrirse. Si el motivo no está claro, copia los **Detalles** en un issue.

</details>

<details>
<summary>Informar de un error</summary>

Usa la plantilla de [informe de error](https://github.com/momokun7/orca-3d-viewer/issues/new?template=bug_report.yml)
y pega el texto de **Detalles**. Si puedes compartir el modelo, indica de dónde viene. Un problema de seguridad va
en un [informe privado](https://github.com/momokun7/orca-3d-viewer/security/advisories/new), no en un issue.

</details>

## Seguridad

Un modelo es una entrada no fiable, así que el visor está hecho para ser un objetivo aburrido de atacar.

- **Aislado**: se ejecuta en el marco aislado de plugins de Orca, con una Content-Security-Policy estricta y sin red.
- **Sin permisos**: el manifiesto no pide ninguna capacidad: ni worker, ni comandos, ni acceso a archivos.
- **Solo lectura**: nunca edita ni guarda el documento, y las URI dentro de un modelo nunca llegan a un cargador.
- **Comprobado antes**: cada formato se comprueba contra límites de tamaño en un hilo aparte antes de decodificar
  nada. Los arrays comprimidos de FBX se descomprimen en pasos pequeños y se detienen en cuanto superan su tamaño declarado.
- **Probado**: la CI ejecuta el visor bajo la política de marcos de Orca con modelos hostiles y generados por fuzzing, y comprueba que el
  bundle incluido en el repositorio se puede reproducir desde el código fuente.

Consulta [SECURITY.md](../../SECURITY.md) para ver los detalles.

## Desarrollo

El código del plugin está en `build/src`. `build/build.mjs` lo empaqueta en `editor/`, que se incluye en el repositorio para que Orca
pueda cargar el plugin sin un paso de compilación.

```sh
cd build
npm ci
npm test
npm run typecheck
npm run build
```

Con [mise](https://mise.jdx.dev), `mise run check` ejecuta todo lo que ejecuta la CI, y `mise tasks` muestra el resto.

Para probar tus cambios en Orca, ejecuta `orca plugin dev watch .` desde la raíz del repositorio, o añade la carpeta en
**Ajustes → Plugins → Desarrollo**.

## Contribuir

Los issues, las etiquetas, el tablero del proyecto, los hitos y los pull requests se describen en
[CONTRIBUTING.md](../../CONTRIBUTING.md). Las traducciones distintas del inglés y el japonés se redactaron a máquina;
las correcciones de hablantes nativos son muy bienvenidas.

## Licencia y créditos

[MIT](../../LICENSE). three.js, meshoptimizer, fflate y Lucide (MIT / ISC) y el decodificador Draco
(Apache-2.0), incluidos en el paquete, conservan sus propias licencias; consulta [THIRD_PARTY_NOTICES.txt](../../THIRD_PARTY_NOTICES.txt).

Los modelos de las imágenes y los GIF proceden de las fuentes de abajo. En cada copia, la conversión de formato, los colores
(los de 3DBenchy, el Armadillo y la tetera los escribimos nosotros en el archivo) y la orientación son edición nuestra.

| Modelo | Usado en | Fuente | Licencia |
| --- | --- | --- | --- |
| Stanford Bunny | Imagen principal, GIF de funciones | [Stanford 3D Scanning Repository](https://graphics.stanford.edu/data/3Dscanrep/). Source: Stanford University Computer Graphics Laboratory | Libre para uso no comercial con atribución |
| Stanford Armadillo | PLY | Igual que arriba | Igual que arriba |
| A Beautiful Game | GLB | Khronos [glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets). Modelo original del MaterialX Project, conversión a glTF de Ed Mackey | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Corset | glTF | Khronos glTF Sample Assets, Microsoft | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| BoomBox | FBX | Khronos glTF Sample Assets, Microsoft | CC0 1.0 |
| 3DBenchy | STL | [3DBenchy.com](https://www.3dbenchy.com/), Creative Tools | CC0 1.0 |
| Utah Teapot | OBJ | [McGuire Computer Graphics Archive](https://casual-effects.com/data), Martin Newell (1975), Kenzie Lamar | CC0 |
| Fox | GIF de animación | Khronos glTF Sample Assets. Modelo de PixelMannen (CC0 1.0), rigging y animación de tomkranis, conversión a glTF de @AsoboStudio y @scurest | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
