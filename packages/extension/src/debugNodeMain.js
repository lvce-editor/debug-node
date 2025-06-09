import * as DebugProvider from './parts/DebugProvider/DebugProvider.js'
import * as PathState from './parts/PathState/PathState.js'

export const activate = ({ path }) => {
  PathState.state.path = path
  // @ts-ignore
  vscode.registerDebugProvider(DebugProvider)
}
