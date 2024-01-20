import * as DebugStart from '../DebugStart/DebugStart.js'
import * as DebugProvider from '../DebugProvider/DebugProvider.js'

export const commandMap = {
  'Debug.evaluate': DebugProvider.evaluate,
  'Debug.getProperties': DebugProvider.getProperties,
  'Debug.pause': DebugProvider.pause,
  'Debug.resume': DebugProvider.resume,
  'Debug.setPauseOnExceptions': DebugProvider.setPauseOnExceptions,
  'Debug.start': DebugStart.debugStart,
  'Debug.step': DebugProvider.step,
  'Debug.stepInto': DebugProvider.stepInto,
  'Debug.stepOut': DebugProvider.stepOut,
  'Debug.stepOver': DebugProvider.stepOver,
}
