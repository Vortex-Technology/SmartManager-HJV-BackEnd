import { randomUUID } from 'node:crypto'

/**
 * @class UniqueEntityId - Unique Entity ID
 *
 * It defines a unique identifier for an entity. Can be instantiated with a existing value or generate a random one
 */
export class UniqueEntityId {
  private value: string

  constructor(value?: string) {
    this.value = value ?? randomUUID()
  }

  public toString() {
    return this.value
  }

  public toValue() {
    return this.value
  }

  public equals(id: UniqueEntityId) {
    return this.value === id.toValue()
  }
}
