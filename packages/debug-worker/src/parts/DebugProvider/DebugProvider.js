import * as DevtoolsCommandType from '../DevtoolsCommandType/DevtoolsCommandType.js'
import * as DevtoolsProtocolDebugger from '../DevtoolsProtocolDebugger/DevtoolsProtocolDebugger.js'
import * as GetJson from '../GetJson/GetJson.js'
import * as PauseOnExceptionState from '../PauseOnExceptionState/PauseOnExceptionState.js'
import * as DevtoolsProtocolRuntime from '../DevtoolsProtocolRuntime/DevtoolsProtocolRuntime.js'
import * as UnwrapDevtoolsEvaluateResult from '../UnwrapDevtoolsEvaluateResult/UnwrapDevtoolsEvaluateResult.js'
import * as Ipc from '../Ipc/Ipc.js'

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
}

const getWebSocketDebuggerUrl = async () => {
  const json = await GetJson.getJson('http://localhost:9229/json/list')
  console.log({ json })
  const process = json[0]
  const { webSocketDebuggerUrl } = process
  return { json, webSocketDebuggerUrl }
}

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
  const { webSocketDebuggerUrl } = await getWebSocketDebuggerUrl()
  const ipc = await Ipc.create(webSocketDebuggerUrl)
  console.log('created ipc')
  const rpc = createRpc(ipc)
  // @ts-ignore
  state.rpc = rpc

  const parsedScripts = Object.create(null)

  const handleScriptParsed = (message) => {
    const params = message.params
    const { scriptId, url, scriptLanguage } = params
    parsedScripts[scriptId] = { url, scriptLanguage }
    emitter.handleScriptParsed({ scriptId, url, scriptLanguage })
  }
  const handlePaused = (message) => {
    console.log('debugger is paused')
    emitter.handlePaused(message.params)
  }
  const handleResumed = (message) => {
    emitter.handleResumed()
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
  console.log({ actualValue })
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
  return DevtoolsProtocolDebugger.getScriptSource(rpc, { scriptId })
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
