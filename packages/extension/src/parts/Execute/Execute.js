import * as EmitterState from '../EmitterState/EmitterState.js'
import * as GetJson from '../GetJson/GetJson.js'

const handleScriptPaused = (...params) => {
  const emitter = EmitterState.get()
  return emitter.handlePaused(...params)
}

const handleScriptParsed = (...params) => {
  const emitter = EmitterState.get()
  return emitter.handleScriptParsed(...params)
}

const handleResumed = (...params) => {
  const emitter = EmitterState.get()
  return emitter.handleResumed(...params)
}

const handleChange = (...params) => {
  const emitter = EmitterState.get()
  return emitter.handleChange(...params)
}

export const commandMap = {
  'Ajax.getJson': GetJson.getJson,
  'Debug.handleChange': handleChange,
  'Debug.handleResumed': handleResumed,
  'Debug.handleScriptParsed': handleScriptParsed,
  'Debug.handleScriptPaused': handleScriptPaused,
}
