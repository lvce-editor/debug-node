import * as DevtoolsCommandType from '../DevtoolsCommandType/DevtoolsCommandType.js'
import * as DevtoolsProtocolDebugger from '../DevtoolsProtocolDebugger/DevtoolsProtocolDebugger.js'
import * as DevtoolsProtocolRuntime from '../DevtoolsProtocolRuntime/DevtoolsProtocolRuntime.js'
import { getWebSocketDebuggerUrl } from '../GetWebSocketDebuggerUrl/GetWebSocketDebuggerUrl.js'
import * as Ipc from '../Ipc/Ipc.js'
import * as PauseOnExceptionState from '../PauseOnExceptionState/PauseOnExceptionState.js'
import * as UnwrapDevtoolsEvaluateResult from '../UnwrapDevtoolsEvaluateResult/UnwrapDevtoolsEvaluateResult.js'

export const id = 'node-debug'

const createRpc = (ipc) => {
  const callbacks = Object.create(null)
  const handleMessage = (message) => {
    if ('id' in message) {
      if ('result' in message) {
        callbacks[message.id].resolve(message)
      } else if ('error' in message) {
        callbacks[message.id].resolve(message)
      }
    } else {
      const listener = listeners[message.method]
      if (listener) {
        listener(message)
      }
    }
  }
  ipc.onmessage = handleMessage

  const listeners = Object.create(null)
  let _id = 0
  return {
    invoke(method, params) {
      return new Promise((resolve, reject) => {
        const id = _id++
        callbacks[id] = { resolve, reject }
        ipc.send({
          method,
          params,
          id,
        })
      })
    },
    on(event, listener) {
      listeners[event] = listener
    },
  }
}

const state = {
  devtoolsProtocol: undefined,
  debuggerId: '',
  rpc: undefined,
  status: 'unavailable',
  /**
   * @type {any[]}
   */
  callStack: [],
  /**
   * @type {any[]}
   */
  scopeChain: [],
  /**
   * @type {any[]}
   */
  scripts: [],
  /**
   * @type {any }
   */
  pausedParams: undefined,

  /**
   * @type {boolean}
   */
  isAvailable: false,
}

export const getStatus = () => {
  const { status, pausedParams, isAvailable } = state
  return {
    status,
    reason: pausedParams?.reason,
    data: pausedParams?.data,
  }
}

export const getCallStack = () => {
  const { pausedParams } = state
  return pausedParams.callFrames
}

export const getScopeChain = () => {
  // const { scopeChain } = state
  // TODO get this from paused params
  return []
}

export const getScripts = () => {
  const { scripts } = state
  return scripts
}

let oldEmitterEnabled = false // old push based emitter

export const start = async (emitter) => {
  // try {
  //   const jsonList = await getJsonList()
  // } catch (error) {
  //   console.log({ error })
  //   if (error && error.code === ErrorCodes.ECONNREFUSED) {
  //     // TODO no debugged process is available
  //     console.log('conn resufsed')
  //   }
  //   return
  // }
  const { webSocketDebuggerUrl, isAvailable } = await getWebSocketDebuggerUrl()
  state.isAvailable = isAvailable
  if (!isAvailable) {
    return
  }
  state.status = 'available'

  const ipc = await Ipc.create(webSocketDebuggerUrl)
  const rpc = createRpc(ipc)
  // @ts-ignore
  state.rpc = rpc

  const parsedScripts = Object.create(null)

  const handleScriptParsed = (message) => {
    const params = message.params
    const { scriptId, url, scriptLanguage } = params
    parsedScripts[scriptId] = { url, scriptLanguage }
    if (oldEmitterEnabled) {
      emitter.handleScriptParsed({ scriptId, url, scriptLanguage })
    }
    state.scripts = [
      ...state.scripts,
      {
        scriptId,
        url,
        scriptLanguage,
      },
    ]
  }
  const handlePaused = (message) => {
    if (oldEmitterEnabled) {
      emitter.handlePaused(message.params)
    }
    state.pausedParams = message.params
    state.status = 'paused'

    try {
      emitter.handleChange({
        type: 'paused',
      })
    } catch {}
  }
  const handleResumed = (message) => {
    if (oldEmitterEnabled) {
      emitter.handleResumed()
    }
    state.status = 'resumed'
    try {
      emitter.handleChange({
        type: 'resumed',
      })
    } catch {}
  }
  rpc.on(DevtoolsCommandType.DebuggerScriptParsed, handleScriptParsed)
  rpc.on(DevtoolsCommandType.DebuggerPaused, handlePaused)
  rpc.on(DevtoolsCommandType.DebuggerResumed, handleResumed)

  const debuggerId = await DevtoolsProtocolDebugger.enable(rpc)
  state.debuggerId = debuggerId
}

export const listProcesses = async () => {
  const { json } = await getWebSocketDebuggerUrl()
  return json
}

export const getProperties = async (objectId) => {
  const { rpc } = state
  return DevtoolsProtocolRuntime.getProperties(rpc, {
    objectId,
    ownProperties: false,
    // @ts-ignore
    accessorPropertiesOnly: false,
    nonIndexedPropertiesOnly: false,
    generatePreview: true,
  })
}

export const resume = async () => {
  const { rpc } = state
  await DevtoolsProtocolDebugger.resume(rpc)
}

export const pause = async () => {
  const { rpc } = state
  await DevtoolsProtocolDebugger.pause(rpc)
}

const transformPauseOnExceptionValue = (value) => {
  switch (value) {
    case 0:
      return PauseOnExceptionState.None
    case 1:
      return PauseOnExceptionState.All
    case 2:
      return PauseOnExceptionState.Uncaught
    default:
      return PauseOnExceptionState.None
  }
}

export const setPauseOnExceptions = async (value) => {
  const { rpc } = state
  const actualValue = transformPauseOnExceptionValue(value)
  await DevtoolsProtocolDebugger.setPauseOnExceptions(rpc, {
    state: actualValue,
  })
}

export const stepOver = async (value) => {
  const { rpc } = state
  // @ts-ignore
  await DevtoolsProtocolDebugger.stepOver(rpc, value)
}

export const stepInto = async (value) => {
  const { rpc } = state
  // @ts-ignore
  await DevtoolsProtocolDebugger.stepInto(rpc, value)
}

export const stepOut = async (value) => {
  const { rpc } = state
  // @ts-ignore
  await DevtoolsProtocolDebugger.stepOut(rpc, value)
}

export const step = async (value) => {
  const { rpc } = state
  // @ts-ignore
  await DevtoolsProtocolDebugger.step(rpc, value)
}

export const getScriptSource = async (scriptId) => {
  const { rpc } = state
  // @ts-ignore
  const result = await DevtoolsProtocolDebugger.getScriptSource(rpc, {
    scriptId,
  })
  const unwrapped = result.result.scriptSource
  return unwrapped
}

export const evaluate = async (expression, callFrameId) => {
  const { rpc } = state
  const result = await DevtoolsProtocolDebugger.evaluateOnCallFrame(rpc, {
    expression,
    callFrameId,
    generatePreview: true,
  })
  const unwrapped = UnwrapDevtoolsEvaluateResult.unwrapResultLoose(result)
  return unwrapped
}
