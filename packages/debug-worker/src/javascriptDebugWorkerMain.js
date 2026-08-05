import { WebWorkerRpcClient } from '@lvce-editor/rpc'
import { commandMap } from './parts/Main/Main.js'

export { commandMap } from './parts/Main/Main.js'

globalThis.rpc = await WebWorkerRpcClient.create({ commandMap })
