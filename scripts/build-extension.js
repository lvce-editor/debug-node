import { bundleJs } from '@lvce-editor/package-extension'
import { mkdir, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const extension = join(root, 'packages', 'extension')
const extensionOutDir = join(extension, 'dist')
const debugWorker = join(root, 'packages', 'debug-worker')
const debugWorkerOutDir = join(debugWorker, 'dist')

await Promise.all([
  rm(extensionOutDir, { force: true, recursive: true }),
  rm(debugWorkerOutDir, { force: true, recursive: true }),
])
await Promise.all([
  mkdir(extensionOutDir, { recursive: true }),
  mkdir(debugWorkerOutDir, { recursive: true }),
])
await Promise.all([
  bundleJs(
    join(extension, 'src', 'debugNodeMain.js'),
    join(extensionOutDir, 'debugNodeMain.js'),
    false,
  ),
  bundleJs(
    join(debugWorker, 'src', 'javascriptDebugWorkerMain.js'),
    join(debugWorkerOutDir, 'javascriptDebugWorkerMain.js'),
    false,
  ),
])
