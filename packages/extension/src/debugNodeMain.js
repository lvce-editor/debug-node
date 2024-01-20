import * as DebugProvider from './parts/DebugProvider/DebugProvider.js'
import * as PathState from './parts/PathState/PathState.js'

export const activate = ({ path }) => {
  PathState.state.path = path
  console.log('hello from debug')
  vscode.registerDebugProvider(DebugProvider)
}
