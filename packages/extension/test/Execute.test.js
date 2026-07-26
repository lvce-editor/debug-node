import * as EmitterState from '../src/parts/EmitterState/EmitterState.js'
import { commandMap } from '../src/parts/Execute/Execute.js'

test('forwards debug worker events to the provider emitter', async () => {
  const invocations = []
  EmitterState.set({
    handleChange(...args) {
      invocations.push(['change', ...args])
    },
    handlePaused(...args) {
      invocations.push(['paused', ...args])
    },
    handleResumed(...args) {
      invocations.push(['resumed', ...args])
    },
    handleScriptParsed(...args) {
      invocations.push(['script-parsed', ...args])
    },
  })

  await commandMap['Debug.handleChange']({ type: 'paused' })
  await commandMap['Debug.handleScriptPaused']({ reason: 'breakpoint' })
  await commandMap['Debug.handleResumed']()
  await commandMap['Debug.handleScriptParsed']({ scriptId: '1' })

  expect(invocations).toEqual([
    ['change', { type: 'paused' }],
    ['paused', { reason: 'breakpoint' }],
    ['resumed'],
    ['script-parsed', { scriptId: '1' }],
  ])
})
