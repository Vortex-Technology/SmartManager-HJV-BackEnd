import { EntityValidator } from './EntityValidator'
import { ZodEntityValidationPipe } from '@shared/pipes/ZodEntityValidation'

/**
 * @class ValueObject - Class to represent a ValueObject. ValueObject is an an entity that no have unique id,
 * @template TypeProps - Define the properties of the ValueObject
 *
 * @prop {TypeProps} props - Properties of the ValueObject
 */
export class ValueObject<TypeProps> implements EntityValidator {
  protected props: TypeProps

  /**
   * A protected constructor that is used to create a new value object with the required properties...
   * The pattern is followwed by the value object class that is extend, implementing a SOLID architecture
   *
   * @param {TypeProps} props - Properties of the ValueObject
   */
  protected constructor(props: TypeProps) {
    this.props = props
  }

  /**
   * Method that is used to validate the value object. It is used to validate the value object after it is created to make sure that it has the correct data.
   *
   * @param {ZodEntityValidationPipe} schema - Object that contains the schema that is used to validate the value object
   * @throws {BadRequestException} - If the value object is not valid it throws a bad request exception and it will be handled by the exception filter
   */
  validate(schema: ZodEntityValidationPipe) {
    schema.transform(this.props)
  }

  /**
   * Method that is used to compare the value object with another value object
   *
   * @param {ValueObject} valueObject - Value object that is compared with the current value object
   * @returns {boolean} - Whether the value objects are equal
   */
  public equals(valueObject: ValueObject<unknown>): boolean {
    if (valueObject === this) {
      return true
    }

    if (JSON.stringify(valueObject.props) === JSON.stringify(this.props)) {
      return true
    }

    return false
  }
}
