import * as DevtoolsCommandType from '../DevtoolsCommandType/DevtoolsCommandType.js'
import { DevtoolsProtocolError } from '../DevtoolsProtocolError/DevtoolsProtocolError.js'

const unwrapResult = (result) => {
  switch (
    result.result.result.type // yes, really
  ) {
    case 'number':
    case 'string':
      return result.result.result.value
    default:
      return result
  }
}

export const create = (rpc) => {
  return {
    Runtime: {
      async evaluate({ expression }) {
        const rawResult = await rpc.invoke(
          DevtoolsCommandType.RuntimeEvaluate,
          {
            expression,
          }
        )
        const result = unwrapResult(rawResult)
        return result
      },
      async getProperties(options) {
        const rawResult = await rpc.invoke(
          DevtoolsCommandType.RuntimeGetProperties,
          options
        )
        const result = unwrapResult(rawResult)
        return result
      },
    },
    Debugger: {
      async enable() {
        const rawResult = await rpc.invoke(DevtoolsCommandType.DebuggerEnable)
        return rawResult.result.debuggerId
      },
      async disable() {
        const rawResult = await rpc.invoke(DevtoolsCommandType.DebuggerDisable)
        console.log(rawResult)
      },
      async pause() {
        const rawResult = await rpc.invoke(DevtoolsCommandType.DebuggerPause)
        if ('error' in rawResult) {
          throw new DevtoolsProtocolError(rawResult.error.message)
        }
      },
      async resume() {
        const rawResult = await rpc.invoke(DevtoolsCommandType.DebuggerResume)
        if ('error' in rawResult) {
          throw new DevtoolsProtocolError(rawResult.error.message)
        }
      },
      async stepInto() {
        const rawResult = await rpc.invoke(DevtoolsCommandType.DebuggerStepInto)
        if ('error' in rawResult) {
          throw new DevtoolsProtocolError(rawResult.error.message)
        }
      },
      async stepOver() {
        const rawResult = await rpc.invoke(DevtoolsCommandType.DebuggerStepOver)
        if ('error' in rawResult) {
          throw new DevtoolsProtocolError(rawResult.error.message)
        }
      },
      async stepOut() {
        const rawResult = await rpc.invoke(DevtoolsCommandType.DebuggerStepOut)
        if ('error' in rawResult) {
          throw new DevtoolsProtocolError(rawResult.error.message)
        }
      },
      async setPauseOnExceptions({ state }) {
        const rawResult = await rpc.invoke(
          DevtoolsCommandType.DebuggerSetPauseOnExceptions,
          {
            state,
          }
        )
        if ('error' in rawResult) {
          throw new DevtoolsProtocolError(rawResult.error.message)
        }
      },
      async evaluateOnCallFrame(params) {
        const rawResult = await rpc.invoke(
          DevtoolsCommandType.DebuggerEvaluateOnCallFrame,
          params
        )
        if ('error' in rawResult) {
          throw new DevtoolsProtocolError(rawResult.error.message)
        }
        return rawResult
      },
    },
    Page: {
      async setFontSizes() {
        throw new Error('not implemented')
      },
      async startScreencast(options) {
        const rawResult = await rpc.invoke(
          DevtoolsCommandType.PageStartScreenCast,
          options
        )
        if ('error' in rawResult) {
          throw new DevtoolsProtocolError(rawResult.error.message)
        }
      },
      async stopScreencast(options) {
        const rawResult = await rpc.invoke(
          DevtoolsCommandType.PageStopScreenCast,
          options
        )
        if ('error' in rawResult) {
          throw new DevtoolsProtocolError(rawResult.error.message)
        }
      },
    },
  }
}
