export const getJson = async (url) => {
  return rpc.invoke('Ajax.getJson', url)
}
