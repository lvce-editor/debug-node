import * as CssCompletion from '../CssCompletion/CssCompletion.js'
import * as CssTabCompletion from '../CssTabCompletion/CssTabCompletion.js'
import * as CssWorkerCommandType from '../DebugWorkerCommandType/DebugWorkerCommandType.js'

export const commandMap = {
  [CssWorkerCommandType.GetTabCompletion]: CssTabCompletion.cssTabCompletion,
  [CssWorkerCommandType.GetCompletion]: CssCompletion.cssCompletion,
}
