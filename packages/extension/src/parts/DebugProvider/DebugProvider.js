import * as DebugNodeUrl from '../DebugNodeUrl/DebugNodeUrl.js'
import * as DebugWorker from '../DebugWorker/DebugWorker.js'

export const id = 'node-debug'

let _emitter

const getJson = async (...params) => {
  const nodePath = DebugNodeUrl.getDebugNodeUrl()
  const nodeRpc = await vscode.createNodeRpc({
    path: nodePath,
    name: 'Debug Worker',
  })
  return nodeRpc.invoke('Ajax.getJson', ...params)
}

const execute = async (method, ...params) => {
  const emitter = _emitter
  if (method === 'Ajax.getJson') {
    return getJson(...params)
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

export const start = async (emitter) => {
  _emitter = emitter
  console.log('start debug')
  const rpc = await DebugWorker.getInstance(execute)
  await rpc.invoke('Debug.start')
}

export const listProcesses = async () => {
  return []
}

export const getProperties = async (objectId) => {
  const rpc = await DebugWorker.getInstance(execute)
  return rpc.invoke('Debug.getProperties', objectId)
}

export const resume = async () => {
  const rpc = await DebugWorker.getInstance(execute)
  return rpc.invoke('Debug.resume')
}

export const pause = async () => {
  const rpc = await DebugWorker.getInstance(execute)
  return rpc.invoke('Debug.pause')
}

export const setPauseOnExceptions = async (value) => {
  const rpc = await DebugWorker.getInstance(execute)
  return rpc.invoke('Debug.setPauseOnExceptions', value)
}

export const stepOver = async (value) => {
  const rpc = await DebugWorker.getInstance(execute)
  return rpc.invoke('Debug.stepOver', value)
}

export const stepInto = async (value) => {
  const rpc = await DebugWorker.getInstance(execute)
  return rpc.invoke('Debug.stepInto', value)
}

export const stepOut = async (value) => {
  const rpc = await DebugWorker.getInstance(execute)
  return rpc.invoke('Debug.stepOut', value)
}

export const step = async (value) => {
  const rpc = await DebugWorker.getInstance(execute)
  return rpc.invoke('Debug.step', value)
}

export const evaluate = async (expression, callFrameId) => {
  const rpc = await DebugWorker.getInstance(execute)
  return rpc.invoke('Debug.evaluate', expression, callFrameId)
}
