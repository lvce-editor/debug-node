import { NodeRpcProcess } from '@lvce-editor/rpc'
import { commandMap } from './parts/Main/Main.js'

await NodeRpcProcess.create({ commandMap })
