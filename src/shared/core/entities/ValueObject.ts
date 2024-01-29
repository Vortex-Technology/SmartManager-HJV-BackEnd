import { EntityValidator } from './EntityValidator'
import { ZodEntityValidationPipe } from '@shared/pipes/ZodEntityValidation'

export class ValueObject<TypeProps> implements EntityValidator {
  protected props: TypeProps

  protected constructor(props: TypeProps) {
    this.props = props
  }

  validate(schema: ZodEntityValidationPipe) {
    schema.transform(this.props)
  }

  public equals(valueObject: ValueObject<unknown>) {
    if (valueObject === this) {
      return true
    }

    if (JSON.stringify(valueObject.props) === JSON.stringify(this.props)) {
      return true
    }

    return false
  }
}
