import * as DebugWorkerUrl from '../DebugWorkerUrl/DebugWorkerUrl.js'

export const state = {
  /**
   * @type {any}
   */
  rpcPromise: undefined,
}

const createRpc = async (execute) => {
  const workerUrl = DebugWorkerUrl.getDebugWorkerUrl()
  const rpc = await vscode.createRpc({
    type: 'worker',
    url: workerUrl,
    name: 'Debug Worker',
    execute,
  })
  return rpc
}

const getOrCreateRpc = async (execute) => {
  if (!state.rpcPromise) {
    state.rpcPromise = createRpc(execute)
  }
  return state.rpcPromise
}

export const getInstance = async (execute) => {
  const rpc = await getOrCreateRpc(execute)
  return rpc
}
