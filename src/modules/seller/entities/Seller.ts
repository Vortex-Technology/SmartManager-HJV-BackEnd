import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'

export interface SellerProps {
  name: string
  login: string
  password: string
  image: string | null

  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}

export class Seller extends AggregateRoot<SellerProps> {
  static create(
    props: Optional<
      SellerProps,
      'createdAt' | 'updatedAt' | 'deletedAt' | 'image'
    >,
    id?: UniqueEntityId,
  ) {
    const sellerProps: SellerProps = {
      ...props,
      login: props.login
        .normalize('NFD')
        .toLowerCase()
        .replaceAll(' ', '-')
        .replace(/[^\w\s-]/gi, ''),
      image: props.image ?? null,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? null,
      deletedAt: props.deletedAt ?? null,
    }

    const seller = new Seller(sellerProps, id)

    return seller
  }

  get name() {
    return this.props.name
  }

  get login() {
    return this.props.login
  }

  get image() {
    return this.props.image
  }

  get password() {
    return this.props.password
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  get deletedAt() {
    return this.props.deletedAt
  }

  set deletedAt(deletedAt: Date | null) {
    this.props.deletedAt = deletedAt
    this.touch()
  }

  touch() {
    this.props.updatedAt = new Date()
  }
}
