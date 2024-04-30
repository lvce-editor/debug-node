import * as DebugProvider from '../DebugProvider/DebugProvider.js'

export const debugStart = async () => {
  console.log('debug start')
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
  }
  await DebugProvider.start(emitter)
}
