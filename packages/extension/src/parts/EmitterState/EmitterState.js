let _emitter

export const get = () => {
  return _emitter
}

export const set = (emitter) => {
  _emitter = emitter
}
