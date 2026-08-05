import { afterAll, expect, jest, test } from '@jest/globals'

const rpc = {
  invoke: jest.fn(),
}
const create = jest.fn(async () => rpc)

jest.unstable_mockModule('@lvce-editor/rpc', () => ({
  WebWorkerRpcClient: { create },
}))

const { commandMap } = await import('../src/javascriptDebugWorkerMain.js')

afterAll(() => {
  // @ts-ignore
  delete globalThis.rpc
})

test('starts a web worker rpc client with the debug command map', () => {
  expect(create).toHaveBeenCalledTimes(1)
  expect(create).toHaveBeenCalledWith({ commandMap })
  // @ts-ignore
  expect(globalThis.rpc).toBe(rpc)
})
