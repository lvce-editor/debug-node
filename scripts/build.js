import { packageExtension } from '@lvce-editor/package-extension'
import { execSync } from 'child_process'
import fs, { cpSync, readFileSync, writeFileSync } from 'fs'
import path, { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const NOT_NEEDED = []

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
fs.copyFileSync(
  join(extension, 'extension.json'),
  join(root, 'dist', 'extension.json'),
)
fs.cpSync(join(extension, 'src'), join(root, 'dist', 'src'), {
  recursive: true,
})

const getAllDependencies = (obj) => {
  if (!obj || !obj.dependencies) {
    return []
  }
  return [obj, ...Object.values(obj.dependencies).flatMap(getAllDependencies)]
}

const getDependencies = (cwd) => {
  const stdout = execSync('npm list --omit=dev --parseable --all', {
    cwd,
  }).toString()
  const lines = stdout.split('\n')
  return lines.slice(1, -1)
}

const copyDependencies = (from, to) => {
  const dependencies = getDependencies(from)
  for (const dependency of dependencies) {
    fs.cpSync(dependency, join(dist, to, dependency.slice(from.length)), {
      recursive: true,
    })
  }
}

copyDependencies(extension, '')

copyDependencies(node, 'node')

for (const notNeeded of NOT_NEEDED) {
  fs.rmSync(join(dist, 'node', notNeeded), { force: true, recursive: true })
}

cpSync(join(root, 'packages', 'node', 'src'), join(dist, 'node', 'src'), {
  recursive: true,
})
cpSync(
  join(root, 'packages', 'node', 'package.json'),
  join(dist, 'node', 'package.json'),
)

fs.cpSync(join(debugWorker, 'src'), join(root, 'dist', 'debug-worker', 'src'), {
  recursive: true,
})

const replace = ({ path, occurrence, replacement }) => {
  const oldContent = readFileSync(path, 'utf-8')
  if (!oldContent.includes(occurrence)) {
    throw new Error(`occurrence not found ${occurrence}`)
  }
  const newContent = oldContent.replace(occurrence, replacement)
  writeFileSync(path, newContent)
}

replace({
  path: join(
    root,
    'dist',
    'src',
    'parts',
    'DebugWorkerUrl',
    'DebugWorkerUrl.js',
  ),
  occurrence: '../debug-worker/',
  replacement: 'debug-worker/',
})
replace({
  path: join(root, 'dist', 'src', 'parts', 'DebugNodeUrl', 'DebugNodeUrl.js'),
  occurrence: '../node/',
  replacement: 'node/',
})

await packageExtension({
  highestCompression: true,
  inDir: join(root, 'dist'),
  outFile: join(root, 'extension.tar.br'),
})
