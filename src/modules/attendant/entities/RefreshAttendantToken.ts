import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'

interface RefreshAttendantTokenProps {
  token: string
  expiresIn: Date
  expiredAt: Date | null
  createdAt: Date
  attendantId: UniqueEntityId
}

export class RefreshAttendantToken extends AggregateRoot<RefreshAttendantTokenProps> {
  static create(
    props: Optional<RefreshAttendantTokenProps, 'expiredAt' | 'createdAt'>,
    id?: UniqueEntityId,
  ) {
    const refreshAttendantTokenProps: RefreshAttendantTokenProps = {
      ...props,
      expiredAt: props.expiredAt ?? null,
      createdAt: props.createdAt ?? new Date(),
    }

    const refreshAttendantToken = new RefreshAttendantToken(
      refreshAttendantTokenProps,
      id,
    )

    return refreshAttendantToken
  }

  get token() {
    return this.props.token
  }

  get expiresIn() {
    return this.props.expiresIn
  }

  get expiredAt() {
    return this.props.expiredAt
  }

  get createdAt() {
    return this.props.createdAt
  }

  get attendantId() {
    return this.props.attendantId
  }
}
