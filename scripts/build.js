import { execSync } from 'child_process'
import fs, { readFileSync } from 'fs'
import path, { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { packageExtension } from '@lvce-editor/package-extension'

const NOT_NEEDED = []

const __dirname = dirname(fileURLToPath(import.meta.url))

const root = path.join(__dirname, '..')
const extension = path.join(root, 'packages', 'extension')

fs.rmSync(join(root, 'dist'), { recursive: true, force: true })

fs.mkdirSync(path.join(root, 'dist'))

const packageJson = JSON.parse(
  readFileSync(join(extension, 'package.json')).toString()
)
delete packageJson.xo
delete packageJson.jest
delete packageJson.prettier
delete packageJson.devDependencies

fs.writeFileSync(
  join(root, 'dist', 'package.json'),
  JSON.stringify(packageJson, null, 2) + '\n'
)
fs.copyFileSync(join(root, 'README.md'), join(root, 'dist', 'README.md'))
fs.copyFileSync(join(extension, 'icon.png'), join(root, 'dist', 'icon.png'))
fs.copyFileSync(
  join(extension, 'extension.json'),
  join(root, 'dist', 'extension.json')
)
fs.cpSync(join(extension, 'src'), join(root, 'dist', 'src'), {
  recursive: true,
})
fs.cpSync(join(extension, 'data'), join(root, 'dist', 'data'), {
  recursive: true,
})

const getAllDependencies = (obj) => {
  if (!obj || !obj.dependencies) {
    return []
  }
  return [obj, ...Object.values(obj.dependencies).flatMap(getAllDependencies)]
}

const getDependencies = () => {
  const stdout = execSync('npm list --omit=dev --parseable --all', {
    cwd: extension,
  }).toString()
  const lines = stdout.split('\n')
  return lines.slice(1, -1)
}

const dependencies = getDependencies()
for (const dependency of dependencies) {
  fs.cpSync(
    dependency,
    join(root, 'dist', dependency.slice(extension.length)),
    {
      recursive: true,
    }
  )
}

for (const notNeeded of NOT_NEEDED) {
  fs.rmSync(join(root, 'dist', notNeeded), { force: true, recursive: true })
}

await packageExtension({
  highestCompression: true,
  inDir: join(root, 'dist'),
  outFile: join(root, 'extension.tar.br'),
})
