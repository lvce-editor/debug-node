import { beforeEach, expect, jest, test } from '@jest/globals'

const getJson = jest.fn()
const getInstance = jest.fn()
const invoke = jest.fn()

jest.unstable_mockModule('../src/parts/GetJson/GetJson.js', () => ({
  getJson,
}))

jest.unstable_mockModule('../src/parts/DebugWorker/DebugWorker.js', () => ({
  getInstance,
}))

const DebugProvider =
  await import('../src/parts/DebugProvider/DebugProvider.js')

beforeEach(() => {
  getJson.mockReset()
  getInstance.mockReset()
  invoke.mockReset()
  getInstance.mockResolvedValue({ invoke })
})

test('resolves the debugger endpoint before starting the debug worker', async () => {
  const calls = []
  getJson.mockImplementation(async () => {
    calls.push('get-json')
    return [{ webSocketDebuggerUrl: 'ws://localhost:9229/debugger' }]
  })
  getInstance.mockImplementation(async () => {
    calls.push('get-debug-worker')
    return { invoke }
  })

  await DebugProvider.start({})

  expect(calls).toEqual(['get-json', 'get-debug-worker'])
  expect(invoke).toHaveBeenCalledWith(
    'Debug.start',
    'ws://localhost:9229/debugger',
    true,
  )
})

test('starts the debug worker as unavailable when endpoint discovery fails', async () => {
  getJson.mockRejectedValue(new Error('connection refused'))

  await DebugProvider.start({})

  expect(invoke).toHaveBeenCalledWith('Debug.start', '', false)
})
