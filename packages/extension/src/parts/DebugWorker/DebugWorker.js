import * as Execute from '../Execute/Execute.js'

// @ts-ignore
const rpc = vscode.createRpc({
  id: 'builtin.debug-node.debug-worker',
  execute: Execute.execute,
})

export const getInstance = async () => {
  return rpc
}

export const invoke = (method, ...params) => {
  return rpc.invoke(method, ...params)
}
