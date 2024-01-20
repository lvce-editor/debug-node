import * as DebugStart from '../DebugStart/DebugStart.js'
import * as DebugProvider from '../DebugProvider/DebugProvider.js'

export const commandMap = {
  'Debug.start': DebugStart.debugStart,
  'Debug.resume': DebugProvider.resume,
  'Debug.pause': DebugProvider.pause,
  'Debug.setPauseOnExceptions': DebugProvider.setPauseOnExceptions,
  'Debug.stepOver': DebugProvider.stepOver,
  'Debug.stepInto': DebugProvider.stepInto,
  'Debug.stepOut': DebugProvider.stepOut,
  'Debug.step': DebugProvider.step,
  'Debug.evaluate': DebugProvider.evaluate,
}
