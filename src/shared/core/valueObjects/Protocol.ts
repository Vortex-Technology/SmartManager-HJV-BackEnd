/**
 * @class Protocol - Define a type protocol of a sale or purchase created on system
 *
 * It can be instantiated with a value or with the system time used to generate a unique identifier
 */
export class Protocol {
  private value: bigint

  constructor(value?: bigint) {
    this.value = value ?? process.hrtime.bigint()
  }

  public toString() {
    return this.value.toString()
  }

  public toValue() {
    return this.value
  }

  public equals(protocol: Protocol) {
    return this.value === protocol.toValue()
  }
}
