import * as PathState from '../PathState/PathState.js'

export const getDebugNodeUrl = () => {
  const nodePath = PathState.state.path + '/../node/src/nodeMain.js'
  return nodePath
}
