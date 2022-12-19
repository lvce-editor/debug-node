export const id = 'node-debug'

const handleMessage = (event) => {
  console.log(event)
}

const createIpc = async (wsUrl) => {
  const webSocket = new WebSocket(wsUrl)
  await new Promise((resolve, reject) => {
    const cleanup = () => {
      webSocket.removeEventListener('open', handleOpen)
      webSocket.removeEventListener('error', handleError)
    }

    const handleOpen = () => {
      cleanup()
      resolve(undefined)
    }
    const handleError = (event) => {
      cleanup()
      reject(new Error(`Failed to start websocket`))
    }
    webSocket.addEventListener('open', handleOpen)
    webSocket.addEventListener('error', handleError)
  })
  return {
    send(message) {
      webSocket.send(JSON.stringify(message, null, 2))
    },
    get onmessage() {
      return webSocket.onmessage
    },
    set onmessage(listener) {
      const handleMessage = (event) => {
        const parsed = JSON.parse(event.data)
        listener(parsed)
      }
      webSocket.onmessage = handleMessage
    },
  }
}

const createRpc = (ipc) => {
  const callbacks = Object.create(null)
  const handleMessage = (message) => {
    if ('id' in message) {
      if ('result' in message) {
        callbacks[message.id].resolve(message)
      } else if ('error' in message) {
        callbacks[message.id].resolve(message)
      }
    }
  }
  ipc.onmessage = handleMessage
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
  }
}

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

const createDevtoolsProtocol = (rpc) => {
  return {
    Runtime: {
      async evaluate({ expression }) {
        const rawResult = await rpc.invoke('Runtime.evaluate', {
          expression,
        })
        const result = unwrapResult(rawResult)
        return result
      },
    },
    Debugger: {
      async enable() {
        const rawResult = await rpc.invoke('Debugger.enable')
        return rawResult.result.debuggerId
      },
      async disable() {
        const rawResult = await rpc.invoke('Debugger.disable')
        console.log(rawResult)
      },
      async pause() {
        const rawResult = await rpc.invoke('Debugger.pause')
        if ('error' in rawResult) {
          throw new Error(rawResult.error.message)
        }
      },
      async resume() {
        const rawResult = await rpc.invoke('Debugger.resume')
        if ('error' in rawResult) {
          throw new Error(rawResult.error.message)
        }
      },
      async setPauseOnExceptions({ state }) {
        const rawResult = await rpc.invoke('Debugger.setPauseOnExceptions', {
          state,
        })
        if ('error' in rawResult) {
          throw new Error(rawResult.error.message)
        }
      },
    },
  }
}

const state = {
  devtoolsProtocol: undefined,
  debuggerId: '',
}

export const listProcesses = async () => {
  const json = await vscode.getJson('http://localhost:9229/json/list')
  const process = json[0]
  const { webSocketDebuggerUrl } = process
  const ipc = await createIpc(webSocketDebuggerUrl)
  const rpc = createRpc(ipc)
  const devtoolsProtocol = createDevtoolsProtocol(rpc)

  const result = await devtoolsProtocol.Runtime.evaluate({
    expression: 'globalThis.x',
  })
  const debuggerId = await devtoolsProtocol.Debugger.enable()
  state.devtoolsProtocol = devtoolsProtocol
  state.debuggerId = debuggerId
  return json
}

export const continue_ = async () => {
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
