import { createNodeRpc } from '@lvce-editor/api'

export const getJson = async (url) => {
  const nodeRpc = await createNodeRpc({
    id: 'builtin.debug-node.node',
  })
  try {
    return await nodeRpc.invoke('Ajax.getJson', url)
  } finally {
    await nodeRpc.dispose()
  }
}
