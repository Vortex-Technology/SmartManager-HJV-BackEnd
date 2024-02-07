import { ZodEntityValidationPipe } from '@shared/pipes/ZodEntityValidation'
import { UniqueEntityId } from '../valueObjects/UniqueEntityId'
import { EntityValidator } from './EntityValidator'
/**
 * @class Entity - Entity is a base class that can be extended to create a new entity. The entity is responsible for validating the data and creating the id
 * @template TypeProps The type of the props
 *
 * @prop {UniqueEntityId} id - The id of the entity
 * @prop {TypeProps} props - The props that are required to create a new entity
 */
export class Entity<TypeProps> implements EntityValidator {
  private _id: UniqueEntityId
  protected props: TypeProps

  /**
   * Property that returns the unique entity id
   * @returns {UniqueEntityId}
   */
  get id(): UniqueEntityId {
    return this._id
  }

  /**
   * A protected constructor that is used to create a new entity with the required properties...
   * The pattern is followwed by the entity class that is extend, implementing a SOLID architecture
   *
   * @param {TypeProps} props - The props that are required to create a new entity
   * @param {UniqueEntityId=} id - The id of the entity. If not provided, it will be generated
   */
  protected constructor(props: TypeProps, id?: UniqueEntityId) {
    this._id = id ?? new UniqueEntityId()
    this.props = props
  }

  /**
   * Method that is used to validate the entity. It is used to validate the entity after it is created to make sure that it has the correct data.
   *
   * @param {ZodEntityValidationPipe} schema - Object that contains the schema that is used to validate the entity
   * @throws {BadRequestException} - If the entity is not valid it throws a bad request exception and it will be handled by the exception filter
   */
  validate(schema: ZodEntityValidationPipe): void {
    schema.transform(this.props)
  }

  /**
   * Method that is used to compare the entity with another entity
   *
   * @param {Entity} entity - Entity that is compared with the current entity
   * @returns {boolean} - Whether the entities are equal
   */
  public equals(entity: Entity<unknown>): boolean {
    if (entity === this) {
      return true
    }

    if (entity.id === this._id) {
      return true
    }

    return false
  }
}
