export const unwrapResult = (result) => {
  if (result.error && result.error.message) {
    throw new Error(result.error.message)
  }
  switch (
    result.result.result.type // yes, really
  ) {
    case 'number':
    case 'string':
    case 'boolean':
    case 'object':
      return result.result.result.value
    case 'undefined':
      return undefined
    case 'function':
      return {
        type: 'function',
        objectId: result.result.result.objectId,
      }
    default:
      return result
  }
}

export const unwrapResultLoose = (result) => {
  if (result.error && result.error.message) {
    throw new Error(result.error.message)
  }
  switch (
    result.result.result.type // yes, really
  ) {
    case 'number':
    case 'string':
    case 'boolean':
    case 'object':
    case 'function':
      return result.result.result
    default:
      return result
  }
}
