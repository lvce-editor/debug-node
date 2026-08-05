import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

test('packages the extension README', async () => {
  await import('./build.js')

  const sourceReadme = await readFile(join(root, 'README.md'), 'utf8')
  const packagedReadme = await readFile(join(root, 'dist', 'README.md'), 'utf8')

  assert.equal(packagedReadme, sourceReadme)
})

test('packages a listening debug worker', async () => {
  await import('./build.js')

  const worker = await readFile(
    join(root, 'dist', 'debug-worker', 'dist', 'javascriptDebugWorkerMain.js'),
    'utf8',
  )

  assert.match(worker, /Debug\.getStatus/)
  assert.match(worker, /globalThis\.rpc/)
  assert.doesNotMatch(worker, /from ['"]@lvce-editor\/rpc['"]/)
})
