import * as DebugNodeUrl from '../DebugNodeUrl/DebugNodeUrl.js'

export const getJson = async (...params) => {
  const nodePath = DebugNodeUrl.getDebugNodeUrl()
  // @ts-ignore
  const nodeRpc = await vscode.createNodeRpc({
    path: nodePath,
    name: 'Debug Worker',
  })
  return nodeRpc.invoke('Ajax.getJson', ...params)
}
