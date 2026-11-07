// Builds ../editor:
//   index.html                the page, with its stylesheet inline;
//   assets/main-<hash>.js     the page's code, plus chunks loaded only for Draco or Meshopt models;
//                             main carries the model-check worker's code as a string;
//   draco/                    the Draco WebAssembly decoder three.js ships;
//   basis/                    the Basis Universal transcoder three.js ships, for KTX2 textures.
// Also writes ../THIRD_PARTY_NOTICES.txt from the packages that end up in the build.
// Usage: npm ci && node build.mjs
import { build } from 'esbuild'
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const HERE = import.meta.dirname
const PLUGIN = path.resolve(HERE, '..')
const EDITOR = path.join(PLUGIN, 'editor')
const NOTICES = path.join(PLUGIN, 'THIRD_PARTY_NOTICES.txt')
const DRACO = path.join(HERE, 'node_modules', 'three', 'examples', 'jsm', 'libs', 'draco', 'gltf')
const DRACO_FILES = ['draco_wasm_wrapper.js', 'draco_decoder.wasm']
const BASIS = path.join(HERE, 'node_modules', 'three', 'examples', 'jsm', 'libs', 'basis')
const BASIS_FILES = ['basis_transcoder.js', 'basis_transcoder.wasm']
// Why: Orca's official catalog refuses any plugin file over 1 MiB; keep to the same bar.
const MAX_FILE_BYTES = 1024 * 1024

// The model checks run in a blob worker; the frame's CSP allows those, and its source travels inside main.
const worker = await build({
  entryPoints: [path.join(HERE, 'src', 'model-check-worker.ts')],
  bundle: true,
  write: false,
  platform: 'browser',
  format: 'iife',
  target: 'chrome120',
  minify: true,
  legalComments: 'none',
  metafile: true,
  logLevel: 'warning',
  absWorkingDir: HERE
})
const workerSource = Buffer.from(worker.outputFiles[0].contents).toString()

const result = await build({
  entryPoints: { main: path.join(HERE, 'src', 'main.ts') },
  define: { MODEL_CHECK_WORKER_SOURCE: JSON.stringify(workerSource) },
  bundle: true,
  splitting: true,
  write: false,
  platform: 'browser',
  format: 'esm',
  target: 'chrome120',
  minify: true,
  legalComments: 'none',
  metafile: true,
  logLevel: 'warning',
  absWorkingDir: HERE,
  outdir: path.join(EDITOR, 'assets'),
  entryNames: '[name]-[hash]',
  chunkNames: 'chunk-[hash]'
})
const mainFile = result.outputFiles.find((file) => path.basename(file.path).startsWith('main-'))

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>3D Viewer</title>
<style>
${readFileSync(path.join(HERE, 'src', 'page.css'), 'utf8').trim()}
</style>
<script type="module" src="./assets/${path.basename(mainFile.path)}"></script>
</head>
<body>
<div id="app"></div>
</body>
</html>
`

const written = [
  { file: path.join(EDITOR, 'index.html'), bytes: Buffer.from(html) },
  ...result.outputFiles.map((file) => ({ file: file.path, bytes: Buffer.from(file.contents) })),
  ...DRACO_FILES.map((name) => ({
    file: path.join(EDITOR, 'draco', name),
    bytes: readFileSync(path.join(DRACO, name))
  })),
  ...BASIS_FILES.map((name) => ({
    file: path.join(EDITOR, 'basis', name),
    bytes: readFileSync(path.join(BASIS, name))
  }))
]
for (const { file, bytes } of written) {
  const name = path.relative(EDITOR, file)
  if (bytes.length > MAX_FILE_BYTES) {
    throw new Error(`${name} is ${bytes.length} bytes; the catalog takes at most ${MAX_FILE_BYTES}`)
  }
  if (file.endsWith('.js') && /\beval\s*\(|\bnew\s+Function\s*\(/.test(bytes.toString())) {
    throw new Error(`${name} evaluates strings as code (eval or Function), which the frame CSP refuses`)
  }
}
rmSync(EDITOR, { recursive: true, force: true })
for (const { file, bytes } of written) {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, bytes)
}

// Notices: every npm package with code in the build, with its licence as reviewed into build/licenses,
// plus the meshoptimizer and Draco decoders that three.js carries under their own licences.
const packages = new Map()
for (const input of [...Object.keys(result.metafile.inputs), ...Object.keys(worker.metafile.inputs)]) {
  const at = input.lastIndexOf('node_modules/')
  if (at === -1) continue
  const name = /^(?:@[^/]+\/)?[^/]+/.exec(input.slice(at + 'node_modules/'.length))[0]
  const dir = path.join(HERE, input.slice(0, at), 'node_modules', name)
  packages.set(name, { ...JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8')), dir })
}
const reviewedLicence = (file) => readFileSync(path.join(HERE, 'licenses', file), 'utf8').trim()
const packageSection = (pkg) => {
  const file = readdirSync(pkg.dir).find((entry) => /^(licen[cs]e|copying)(\.|$)/i.test(entry))
  if (!file) throw new Error(`${pkg.name} ships no licence file`)
  const text = readFileSync(path.join(pkg.dir, file), 'utf8').trim()
  // Why: build/licenses keeps the reviewed text in git; a dependency bump that changes it fails here.
  if (text !== reviewedLicence(`${pkg.name.replace('/', '__')}.txt`)) {
    throw new Error(`${pkg.name}'s licence differs from build/licenses; review and update it`)
  }
  return `${pkg.name}@${pkg.version} (${pkg.license})\n${pkg.homepage ?? ''}\n\n${text}`
}
const three = packages.get('three')
const sections = [
  ...[...packages.values()].sort((a, b) => a.name.localeCompare(b.name)).map(packageSection),
  `meshoptimizer decoder, bundled in three@${three.version} (MIT)\nhttps://github.com/zeux/meshoptimizer\n\n${reviewedLicence('meshoptimizer.txt')}`,
  `ktx-parse, bundled in three@${three.version} (MIT)\nhttps://github.com/donmccurdy/KTX-Parse\n\n${reviewedLicence('ktx-parse.txt')}`,
  `zstddec, bundled in three@${three.version} (MIT)\nhttps://github.com/donmccurdy/zstddec\n\n${reviewedLicence('zstddec.txt')}`,
  `Draco decoder (editor/draco/), shipped in three@${three.version} (Apache-2.0)\nhttps://github.com/google/draco\n\n${reviewedLicence('apache-2.0.txt')}`,
  `Basis Universal transcoder (editor/basis/), shipped in three@${three.version} (Apache-2.0)\nhttps://github.com/BinomialLLC/basis_universal\n\n${reviewedLicence('basis-universal-notice.txt')}\n\n${reviewedLicence('apache-2.0.txt')}`
]
writeFileSync(
  NOTICES,
  `3D Viewer's editor/ folder includes the following software.\n\n` +
    `${sections.join(`\n\n${'='.repeat(78)}\n\n`)}\n`
)

for (const { file, bytes } of written) {
  console.log(`${path.relative(PLUGIN, file).replaceAll('\\', '/')}: ${bytes.length} bytes`)
}
