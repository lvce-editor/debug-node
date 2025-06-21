import * as GetJson from '../GetJson/GetJson.js'

export const getWebSocketDebuggerUrl = async () => {
  try {
    const json = await GetJson.getJson('http://localhost:9229/json/list')
    const process = json[0]
    const { webSocketDebuggerUrl } = process
    return { json, webSocketDebuggerUrl, isAvailable: true }
  } catch (error) {
    return {
      json: {},
      webSocketDebuggerUrl: '',
      isAvailable: false,
    }
  }
}
