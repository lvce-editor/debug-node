import { bundleJs } from '@lvce-editor/package-extension'
import { mkdir, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const extension = join(root, 'packages', 'extension')
const outDir = join(extension, 'dist')

await rm(outDir, { force: true, recursive: true })
await mkdir(outDir, { recursive: true })
await bundleJs(
  join(extension, 'src', 'debugNodeMain.js'),
  join(outDir, 'debugNodeMain.js'),
  false,
)
