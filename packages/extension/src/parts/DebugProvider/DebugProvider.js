import * as DevtoolsCommandType from '../DevtoolsCommandType/DevtoolsCommandType.js'
import * as DevtoolsProtocol from '../DevtoolsProtocol/DevtoolsProtocol.js'
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
}

const getWebSocketDebuggerUrl = async () => {
  const json = await vscode.getJson('http://localhost:9229/json/list')
  const process = json[0]
  const { webSocketDebuggerUrl } = process
  return { json, webSocketDebuggerUrl }
}

export const start = async (emitter) => {
  const { webSocketDebuggerUrl } = await getWebSocketDebuggerUrl()
  const ipc = await Ipc.create(webSocketDebuggerUrl)
  const rpc = createRpc(ipc)
  const devtoolsProtocol = DevtoolsProtocol.create(rpc)
  state.devtoolsProtocol = devtoolsProtocol
  const { Runtime, Debugger, Page } = devtoolsProtocol

  const parsedScripts = Object.create(null)

  const debuggerId = await Debugger.enable()
  state.debuggerId = debuggerId

  const handleScriptParsed = (message) => {
    const params = message.params
    const { scriptId, url, scriptLanguage } = params
    parsedScripts[scriptId] = { url, scriptLanguage }
    console.log({ scriptId, url, scriptLanguage })
    emitter.handleScriptParsed({ scriptId, url, scriptLanguage })
  }
  const handlePaused = (message) => {
    emitter.handlePaused(message.params)
  }
  const handleResumed = (message) => {
    emitter.handleResumed()
  }
  rpc.on(DevtoolsCommandType.DebuggerScriptParsed, handleScriptParsed)
  rpc.on(DevtoolsCommandType.DebuggerPaused, handlePaused)
  rpc.on(DevtoolsCommandType.DebuggerResumed, handleResumed)
}

export const listProcesses = async () => {
  const { json } = await getWebSocketDebuggerUrl()
  return json
}

export const getProperties = async (objectId) => {
  const { devtoolsProtocol } = state
  return devtoolsProtocol.Runtime.getProperties({
    objectId,
    ownProperties: false,
    accessorPropertiesOnly: false,
    nonIndexedPropertiesOnly: false,
    generatePreview: true,
  })
}

export const resume = async () => {
  const { devtoolsProtocol } = state
  await devtoolsProtocol.Debugger.resume()
}

export const pause = async () => {
  const { devtoolsProtocol } = state
  await devtoolsProtocol.Debugger.pause()
}

export const setPauseOnExceptions = async (value) => {
  const { devtoolsProtocol } = state
  await devtoolsProtocol.Debugger.setPauseOnExceptions(value)
}

export const stepOver = async (value) => {
  const { devtoolsProtocol } = state
  await devtoolsProtocol.Debugger.stepOver(value)
}

export const stepInto = async (value) => {
  const { devtoolsProtocol } = state
  await devtoolsProtocol.Debugger.stepInto(value)
}

export const stepOut = async (value) => {
  const { devtoolsProtocol } = state
  await devtoolsProtocol.Debugger.stepOut(value)
}

export const step = async (value) => {
  const { devtoolsProtocol } = state
  await devtoolsProtocol.Debugger.step(value)
}

export const evaluate = async (expression, callFrameId) => {
  const { devtoolsProtocol } = state
  const result = await devtoolsProtocol.Debugger.evaluateOnCallFrame({
    expression,
    callFrameId,
  })
  console.log({ result })
  return result
}
