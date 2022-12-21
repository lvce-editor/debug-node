export class DevtoolsProtocolError extends Error {
  constructor(message) {
    super(message)
    this.name = 'DevtoolsProtocolError'
  }
}
