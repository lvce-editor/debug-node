import * as DebugNodeUrl from '../DebugNodeUrl/DebugNodeUrl.js'
import * as EmitterState from '../EmitterState/EmitterState.js'

const getJson = async (...params) => {
  const nodePath = DebugNodeUrl.getDebugNodeUrl()
  // @ts-ignore
  const nodeRpc = await vscode.createNodeRpc({
    path: nodePath,
    name: 'Debug Worker',
  })
  return nodeRpc.invoke('Ajax.getJson', ...params)
}

export const execute = async (method, ...params) => {
  const emitter = EmitterState.get()
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
