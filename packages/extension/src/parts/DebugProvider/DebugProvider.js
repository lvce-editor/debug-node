import * as DebugWorker from '../DebugWorker/DebugWorker.js'
import * as EmitterState from '../EmitterState/EmitterState.js'

export const id = 'node-debug'

export const start = async (emitter) => {
  EmitterState.set(emitter)
  const rpc = await DebugWorker.getInstance()
  await rpc.invoke('Debug.start')
}

export const listProcesses = async () => {
  return []
}

export const getProperties = async (objectId) => {
  const rpc = await DebugWorker.getInstance()
  return rpc.invoke('Debug.getProperties', objectId)
}

export const resume = async () => {
  const rpc = await DebugWorker.getInstance()
  return rpc.invoke('Debug.resume')
}

export const pause = async () => {
  const rpc = await DebugWorker.getInstance()
  return rpc.invoke('Debug.pause')
}

export const setPauseOnExceptions = async (value) => {
  const rpc = await DebugWorker.getInstance()
  return rpc.invoke('Debug.setPauseOnExceptions', value)
}

export const stepOver = async (value) => {
  const rpc = await DebugWorker.getInstance()
  return rpc.invoke('Debug.stepOver', value)
}

export const stepInto = async (value) => {
  const rpc = await DebugWorker.getInstance()
  return rpc.invoke('Debug.stepInto', value)
}

export const stepOut = async (value) => {
  const rpc = await DebugWorker.getInstance()
  return rpc.invoke('Debug.stepOut', value)
}

export const step = async (value) => {
  const rpc = await DebugWorker.getInstance()
  return rpc.invoke('Debug.step', value)
}

export const evaluate = async (expression, callFrameId) => {
  const rpc = await DebugWorker.getInstance()
  return rpc.invoke('Debug.evaluate', expression, callFrameId)
}

export const getScriptSource = async (scriptId) => {
  const rpc = await DebugWorker.getInstance()
  return rpc.invoke('Debug.getScriptSource', scriptId)
}
