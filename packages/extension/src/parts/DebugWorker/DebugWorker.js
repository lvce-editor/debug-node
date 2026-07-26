import { createRpc } from '@lvce-editor/api'
import * as DebugWorkerUrl from '../DebugWorkerUrl/DebugWorkerUrl.js'
import * as Execute from '../Execute/Execute.js'

/**
 * @typedef {{
 *   invoke(method: string, ...params: readonly unknown[]): Promise<any>
 * }} Rpc
 */

/** @type {{ rpcPromise: Promise<Rpc> | undefined }} */
const state = {
  rpcPromise: undefined,
}

/** @returns {Promise<Rpc>} */
export const getInstance = () => {
  state.rpcPromise ||= createRpc({
    commandMap: Execute.commandMap,
    name: 'Debug Node Worker',
    url: DebugWorkerUrl.getDebugWorkerUrl(),
  })
  return state.rpcPromise
}

export const invoke = async (method, ...params) => {
  const rpc = await getInstance()
  return rpc.invoke(method, ...params)
}
