import { bundleJs, packageExtension } from '@lvce-editor/package-extension'
import fs, { cpSync, readFileSync, writeFileSync } from 'fs'
import path, { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const extension = path.join(root, 'packages', 'extension')
const node = path.join(root, 'packages', 'node')
const dist = join(root, 'dist')
const debugWorker = path.join(root, 'packages', 'debug-worker')

fs.rmSync(join(root, 'dist'), { recursive: true, force: true })

fs.mkdirSync(path.join(root, 'dist'))

const packageJson = JSON.parse(
  readFileSync(join(extension, 'package.json')).toString(),
)
delete packageJson.xo
delete packageJson.jest
delete packageJson.prettier
delete packageJson.devDependencies

fs.writeFileSync(
  join(root, 'dist', 'package.json'),
  JSON.stringify(packageJson, null, 2) + '\n',
)
fs.copyFileSync(join(root, 'README.md'), join(root, 'dist', 'README.md'))
fs.copyFileSync(join(root, 'demo.png'), join(root, 'dist', 'demo.png'))
fs.copyFileSync(
  join(extension, 'extension.json'),
  join(root, 'dist', 'extension.json'),
)
fs.cpSync(join(extension, 'src'), join(root, 'dist', 'src'), {
  recursive: true,
})

cpSync(join(root, 'packages', 'node', 'src'), join(dist, 'node', 'src'), {
  recursive: true,
})
cpSync(
  join(root, 'packages', 'node', 'package.json'),
  join(dist, 'node', 'package.json'),
)

fs.mkdirSync(join(root, 'dist', 'debug-worker', 'dist'), { recursive: true })

const replace = ({ path, occurrence, replacement }) => {
  const oldContent = readFileSync(path, 'utf-8')
  if (!oldContent.includes(occurrence)) {
    throw new Error(`occurrence not found ${occurrence}`)
  }
  const newContent = oldContent.replace(occurrence, replacement)
  writeFileSync(path, newContent)
}

replace({
  path: join(root, 'dist', 'extension.json'),
  occurrence: '../debug-worker/',
  replacement: 'debug-worker/',
})
replace({
  path: join(root, 'dist', 'extension.json'),
  occurrence: '../node/',
  replacement: 'node/',
})

await bundleJs(
  join(extension, 'src', 'debugNodeMain.js'),
  join(root, 'dist', 'dist', 'debugNodeMain.js'),
  false,
)

await bundleJs(
  join(debugWorker, 'src', 'javascriptDebugWorkerMain.js'),
  join(root, 'dist', 'debug-worker', 'dist', 'javascriptDebugWorkerMain.js'),
  false,
)

replace({
  path: join(root, 'dist', 'dist', 'debugNodeMain.js'),
  occurrence: '../../debug-worker/',
  replacement: '../debug-worker/',
})

await packageExtension({
  highestCompression: true,
  inDir: join(root, 'dist'),
  outFile: join(root, 'extension.tar.br'),
})
