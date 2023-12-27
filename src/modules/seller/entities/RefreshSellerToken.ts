import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'

interface RefreshSellerTokenProps {
  token: string
  expiresIn: Date
  expiredAt: Date | null
  createdAt: Date
  sellerId: UniqueEntityId
}

export class RefreshSellerToken extends AggregateRoot<RefreshSellerTokenProps> {
  static create(
    props: Optional<RefreshSellerTokenProps, 'expiredAt' | 'createdAt'>,
    id?: UniqueEntityId,
  ) {
    const refreshSellerTokenProps: RefreshSellerTokenProps = {
      ...props,
      expiredAt: props.expiredAt ?? null,
      createdAt: props.createdAt ?? new Date(),
    }

    const refreshSellerToken = new RefreshSellerToken(
      refreshSellerTokenProps,
      id,
    )

    return refreshSellerToken
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

  get sellerId() {
    return this.props.sellerId
  }
}
