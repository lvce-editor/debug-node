import * as DebugWorkerUrl from '../DebugWorkerUrl/DebugWorkerUrl.js'

export const state = {
  /**
   * @type {any}
   */
  rpcPromise: undefined,
}

const createRpc = async () => {
  const workerUrl = DebugWorkerUrl.getDebugWorkerUrl()
  const rpc = await vscode.createRpc({
    type: 'worker',
    url: workerUrl,
    name: 'Debug Worker',
  })
  return rpc
}

const getOrCreateRpc = async () => {
  if (!state.rpcPromise) {
    state.rpcPromise = createRpc()
  }
  return state.rpcPromise
}

export const getInstance = async () => {
  const rpc = await getOrCreateRpc()
  return rpc
}
