import * as DevtoolsCommandType from '../DevtoolsCommandType/DevtoolsCommandType.js'
import * as UnwrapDevtoolsEvaluateResult from '../UnwrapDevtoolsEvaluateResult/UnwrapDevtoolsEvaluateResult.js'

/**
 *
 * @param {{objectId: string, ownProperties?:boolean, generatePreview?:boolean}} options
 * @returns
 */
export const getProperties = async (rpc, options) => {
  const rawResult = await rpc.invoke(
    DevtoolsCommandType.RuntimeGetProperties,
    options,
  )
  const result = UnwrapDevtoolsEvaluateResult.unwrapResult(rawResult)
  return result
}
