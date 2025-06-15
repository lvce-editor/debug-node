import * as DebugProvider from '../DebugProvider/DebugProvider.js'

export const debugStart = async () => {
  const emitter = {
    handleScriptParsed(args) {
      // @ts-ignore
      rpc.invoke('Debug.handleScriptParsed', args)
    },
    handlePaused(message) {
      // @ts-ignore
      rpc.invoke('Debug.handleScriptPaused', message)
    },
    handleResumed() {
      // @ts-ignore
      rpc.invoke('Debug.handleResumed')
    },
    handleChange(params) {
      // @ts-ignore
      rpc.invoke('Debug.handleChange', params)
    },
  }
  await DebugProvider.start(emitter)
}
