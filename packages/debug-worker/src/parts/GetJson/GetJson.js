export const getJson = async (url) => {
  // @ts-ignore
  return rpc.invoke('Ajax.getJson', url)
}
