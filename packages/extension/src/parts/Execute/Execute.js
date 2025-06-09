import * as EmitterState from '../EmitterState/EmitterState.js'
import * as GetJson from '../GetJson/GetJson.js'

export const execute = async (method, ...params) => {
  const emitter = EmitterState.get()
  if (method === 'Ajax.getJson') {
    return GetJson.getJson(...params)
  } else if (method === 'Debug.handleScriptPaused') {
    emitter.handlePaused(...params)
  } else if (method === 'Debug.handleScriptParsed') {
    emitter.handleScriptParsed(...params)
  } else if (method === 'Debug.handleResumed') {
    emitter.handleResumed(...params)
  } else {
    console.log({ method })
  }
}
