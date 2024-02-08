import { ValueObject } from '@shared/core/entities/ValueObject'
import { Optional } from '@shared/core/types/Optional'

export interface DocColumnProps {
  xPosition: number
  fontSize: number
  text: string
}

export class DocColumn extends ValueObject<DocColumnProps> {
  static create(props: Optional<DocColumnProps, 'fontSize'>) {
    return new DocColumn({ ...props, fontSize: props.fontSize ?? 14 })
  }

  get xPosition() {
    return this.props.xPosition
  }

  get text() {
    return this.props.text
  }

  get fontSize() {
    return this.props.fontSize
  }
}
