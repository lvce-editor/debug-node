import * as UnwrapDevtoolsEvaluateResult from '../src/parts/UnwrapDevtoolsEvaluateResult/UnwrapDevtoolsEvaluateResult.js'
import { test, expect } from '@jest/globals'

test('error - invalid remote object id', () => {
  const result = {
    id: 2,
    error: {
      code: -32000,
      message: 'invalid remote object id',
    },
  }
  expect(() => UnwrapDevtoolsEvaluateResult.unwrapResult(result)).toThrow(
    new Error('invalid remote object id'),
  )
})
