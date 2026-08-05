import { readFileSync } from 'node:fs'

const manifestUrl = new URL('../extension.json', import.meta.url)
const manifest = JSON.parse(readFileSync(manifestUrl, 'utf8'))

test('uses the isolated extension api', () => {
  expect(manifest.browser).toBe('dist/debugNodeMain.js')
  expect(manifest.isolated).toBe(true)
})

test('declares the debug web worker rpc', () => {
  expect(manifest.rpc).toContainEqual({
    contentSecurityPolicy: ["default-src 'none'", "script-src 'self'"],
    id: 'builtin.debug-node.debug-worker',
    name: 'Debug Node Worker',
    type: 'web-worker',
    url: '../debug-worker/dist/javascriptDebugWorkerMain.js',
  })
})

test('declares the debug node rpc', () => {
  expect(manifest.rpc).toContainEqual({
    id: 'builtin.debug-node.node',
    name: 'Debug Node',
    type: 'node',
    url: '../node/src/nodeMain.js',
  })
})
