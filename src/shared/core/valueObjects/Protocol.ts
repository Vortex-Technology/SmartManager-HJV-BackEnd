export class Protocol {
  private value: bigint

  constructor(value?: bigint) {
    this.value = value ?? process.hrtime.bigint()
  }

  public toString() {
    return this.value
  }

  public toValue() {
    return this.value
  }

  public equals(protocol: Protocol) {
    return this.value === protocol.toValue()
  }
}
