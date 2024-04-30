export const create = async (wsUrl) => {
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
        // @ts-ignore
        listener(parsed)
      }
      webSocket.onmessage = handleMessage
    },
  }
}
