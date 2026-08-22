import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import test from 'node:test'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  NodeForkedProcessRpcParent,
  WebSocketRpcParent,
} from '@lvce-editor/rpc'

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

test('starts the packaged node process and invokes a debug command', async () => {
  await import('./build.js')

  const server = createServer((request, response) => {
    response.setHeader('content-type', 'application/json')
    response.end(JSON.stringify({ value: 'debug-process-ok' }))
  })
  const sockets = new Set()
  let controlRpc
  let rpc
  try {
    const processPath = join(root, 'dist', 'dist', 'nodeProcess.js')
    const childRpc = await NodeForkedProcessRpcParent.create({
      commandMap: {},
      path: processPath,
    })
    controlRpc = childRpc
    const { promise: attached, reject, resolve } = Promise.withResolvers()
    server.on('upgrade', (request, socket) => {
      sockets.add(socket)
      socket.once('close', () => sockets.delete(socket))
      socket.pause()
      const serializableRequest = {
        headers: request.headers,
        method: request.method,
        url: request.url,
      }
      const attach = async () => {
        try {
          await childRpc.invokeAndTransfer(
            'NodeRpcProcess.handleWebSocket',
            socket,
            serializableRequest,
          )
          resolve()
        } catch (error) {
          reject(error)
        }
      }
      void attach()
    })
    await new Promise((resolve, reject) => {
      server.once('error', reject)
      server.listen(0, '127.0.0.1', resolve)
    })
    const address = server.address()
    assert.ok(address && typeof address === 'object')
    const webSocket = new WebSocket(`ws://127.0.0.1:${address.port}`)
    rpc = await WebSocketRpcParent.create({ commandMap: {}, webSocket })
    await attached

    const result = await rpc.invoke(
      'Ajax.getJson',
      `http://127.0.0.1:${address.port}/fixture`,
    )

    assert.deepEqual(result, { value: 'debug-process-ok' })
  } finally {
    await rpc?.dispose()
    await controlRpc?.dispose()
    for (const socket of sockets) {
      socket.destroy()
    }
    server.closeAllConnections()
    await new Promise((resolve) => server.close(resolve))
  }
})
