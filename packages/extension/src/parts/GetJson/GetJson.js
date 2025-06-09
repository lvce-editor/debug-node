import * as DebugNodeUrl from '../DebugNodeUrl/DebugNodeUrl.js'

// const getJsonLocal = async (url) => {
//   const response = await fetch(url)
//   if (!response.ok) {
//     throw new Error(response.statusText)
//   }
//   const json = await response.json()
//   return json
// }

export const getJson = async (url) => {
  // if (url && url.startsWith('http://localhost')) {
  //   return getJsonLocal(url)
  // }

  const nodePath = DebugNodeUrl.getDebugNodeUrl()
  // @ts-ignore
  const nodeRpc = await vscode.createNodeRpc({
    path: nodePath,
    name: 'Debug Worker',
  })
  const json = await nodeRpc.invoke('Ajax.getJson', url)
  await nodeRpc.dispose()
  return json
}
