import { ZodEntityValidationPipe } from '@shared/pipes/ZodEntityValidation'
import { UniqueEntityId } from '../valueObjects/UniqueEntityId'
import { EntityValidator } from './EntityValidator'
/**
 *
 * Entity is a base class that can be extended to create a new entity
 * The entity is responsible for validating the data and creating the id
 */
export class Entity<TypeProps> implements EntityValidator {
  private _id: UniqueEntityId
  protected props: TypeProps

  get id() {
    return this._id
  }

  protected constructor(props: TypeProps, id?: UniqueEntityId) {
    this._id = id ?? new UniqueEntityId()
    this.props = props
  }

  validate(schema: ZodEntityValidationPipe) {
    schema.transform(this.props)
  }

  public equals(entity: Entity<unknown>) {
    if (entity === this) {
      return true
    }

    if (entity.id === this._id) {
      return true
    }

    return false
  }
}
