import { beforeEach, expect, jest, test } from '@jest/globals'

const start = jest.fn()

jest.unstable_mockModule('../src/parts/DebugProvider/DebugProvider.js', () => ({
  start,
}))

const { debugStart } = await import('../src/parts/DebugStart/DebugStart.js')

beforeEach(() => {
  start.mockReset()
})

test('starts the provider with the resolved debugger endpoint', async () => {
  await debugStart('ws://localhost:9229/debugger', true)

  expect(start).toHaveBeenCalledWith(
    expect.objectContaining({
      handleChange: expect.any(Function),
      handlePaused: expect.any(Function),
      handleResumed: expect.any(Function),
      handleScriptParsed: expect.any(Function),
    }),
    'ws://localhost:9229/debugger',
    true,
  )
})
