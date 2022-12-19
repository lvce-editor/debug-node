import * as DebugProvider from './parts/DebugProvider/DebugProvider.js'

export const activate = () => {
  console.log('hello from debug')
  vscode.registerDebugProvider(DebugProvider)
}
