import {
  activate as activateExtensionApi,
  registerDebugProvider,
} from '@lvce-editor/api'
import * as DebugProvider from './parts/DebugProvider/DebugProvider.js'

const state = {
  isActivated: false,
}

export const activate = async () => {
  if (state.isActivated) {
    return
  }
  state.isActivated = true
  await activateExtensionApi()
  registerDebugProvider(DebugProvider)
}

export const deactivate = () => {}

await activate()
