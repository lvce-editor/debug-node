import * as DebugProvider from '../DebugProvider/DebugProvider.js'

export const debugStart = async () => {
  console.log('debug start')
  const emitter = {
    handleScriptParsed(args) {
      rpc.invoke('Debug.handleScriptParsed', args)
    },
    handlePaused(message) {
      rpc.invoke('Debug.handleScriptPaused', message)
    },
    handleResumed() {
      rpc.invoke('Debug.handleResumed')
    },
  }
  await DebugProvider.start(emitter)
}
