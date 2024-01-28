export class ValueObject<TypeProps> {
  protected props: TypeProps

  protected constructor(props: TypeProps) {
    this.props = props
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
