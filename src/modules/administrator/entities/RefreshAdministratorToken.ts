import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'

interface RefreshAdministratorTokenProps {
  token: string
  expiresIn: Date
  expiredAt: Date | null
  createdAt: Date
  administratorId: UniqueEntityId
}

export class RefreshAdministratorToken extends AggregateRoot<RefreshAdministratorTokenProps> {
  static create(
    props: Optional<RefreshAdministratorTokenProps, 'expiredAt' | 'createdAt'>,
    id?: UniqueEntityId,
  ) {
    const refreshAdministratorTokenProps: RefreshAdministratorTokenProps = {
      ...props,
      expiredAt: props.expiredAt ?? null,
      createdAt: props.createdAt ?? new Date(),
    }

    const refreshAdministratorToken = new RefreshAdministratorToken(
      refreshAdministratorTokenProps,
      id,
    )

    return refreshAdministratorToken
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

  get administratorId() {
    return this.props.administratorId
  }
}
