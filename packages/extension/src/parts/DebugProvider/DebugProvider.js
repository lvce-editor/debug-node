import * as DebugWorker from '../DebugWorker/DebugWorker.js'
import * as DevtoolsProtocolDebugger from '../DevtoolsProtocolDebugger/DevtoolsProtocolDebugger.js'
import * as DevtoolsProtocolRuntime from '../DevtoolsProtocolRuntime/DevtoolsProtocolRuntime.js'

export const id = 'node-debug'

export const start = async (emitter) => {
  console.log('start debug')
  const execute = (message) => {
    console.log('got message', message)
  }
  const rpc = await DebugWorker.getInstance(execute)
  await rpc.invoke('Debug.start')
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
  // const { webSocketDebuggerUrl } = await getWebSocketDebuggerUrl()
  // const ipc = await Ipc.create(webSocketDebuggerUrl)
  // const rpc = createRpc(ipc)
  // state.rpc = rpc
  // const parsedScripts = Object.create(null)
  // const debuggerId = await DevtoolsProtocolDebugger.enable(rpc)
  // state.debuggerId = debuggerId
  // const handleScriptParsed = (message) => {
  //   const params = message.params
  //   const { scriptId, url, scriptLanguage } = params
  //   parsedScripts[scriptId] = { url, scriptLanguage }
  //   console.log({ scriptId, url, scriptLanguage })
  //   emitter.handleScriptParsed({ scriptId, url, scriptLanguage })
  // }
  // const handlePaused = (message) => {
  //   console.log('debugger is paused')
  //   emitter.handlePaused(message.params)
  // }
  // const handleResumed = (message) => {
  //   emitter.handleResumed()
  // }
  // rpc.on(DevtoolsCommandType.DebuggerScriptParsed, handleScriptParsed)
  // rpc.on(DevtoolsCommandType.DebuggerPaused, handlePaused)
  // rpc.on(DevtoolsCommandType.DebuggerResumed, handleResumed)
}

export const listProcesses = async () => {
  console.log('list them')
  return []
}

export const getProperties = async (objectId) => {
  const { rpc } = state
  return DevtoolsProtocolRuntime.getProperties(rpc, {
    objectId,
    ownProperties: false,
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

export const setPauseOnExceptions = async (value) => {
  const { rpc } = state
  await DevtoolsProtocolDebugger.setPauseOnExceptions(rpc, value)
}

export const stepOver = async (value) => {
  const { rpc } = state
  await DevtoolsProtocolDebugger.stepOver(rpc, value)
}

export const stepInto = async (value) => {
  const { rpc } = state
  await DevtoolsProtocolDebugger.stepInto(rpc, value)
}

export const stepOut = async (value) => {
  const { rpc } = state
  await DevtoolsProtocolDebugger.stepOut(rpc, value)
}

export const step = async (value) => {
  const { rpc } = state
  await DevtoolsProtocolDebugger.step(rpc, value)
}

export const evaluate = async (expression, callFrameId) => {
  const { rpc } = state
  const result = await DevtoolsProtocolDebugger.evaluateOnCallFrame(rpc, {
    expression,
    callFrameId,
  })
  console.log({ result })
  return result
}
