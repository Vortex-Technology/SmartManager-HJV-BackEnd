import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'

export interface RefreshTokenProps {
  token: string
  expiresIn: Date
  expiredAt: Date | null
  createdAt: Date
  collaboratorId: UniqueEntityId
}

export class RefreshToken extends AggregateRoot<RefreshTokenProps> {
  static create(
    props: Optional<RefreshTokenProps, 'expiredAt' | 'createdAt'>,
    id?: UniqueEntityId,
  ) {
    const refreshTokenProps: RefreshTokenProps = {
      ...props,
      expiredAt: props.expiredAt ?? null,
      createdAt: props.createdAt ?? new Date(),
    }

    const refreshToken = new RefreshToken(refreshTokenProps, id)

    return refreshToken
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

  get collaboratorId() {
    return this.props.collaboratorId
  }
}
