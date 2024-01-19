import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'

export interface UserProps {
  name: string
  image?: string | null
  email: string
  emailVerifiedAt: Date | null
  password: string
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}

export class User extends AggregateRoot<UserProps> {
  static create(
    props: Optional<
      UserProps,
      'createdAt' | 'updatedAt' | 'deletedAt' | 'emailVerifiedAt' | 'image'
    >,
    id?: UniqueEntityId,
  ) {
    const userProps: UserProps = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? null,
      deletedAt: props.deletedAt ?? null,
      emailVerifiedAt: props.emailVerifiedAt ?? null,
      image: props.image ?? null,
    }

    const user = new User(userProps, id)

    return user
  }

  get name() {
    return this.props.name
  }

  get image() {
    return this.props.image
  }

  get email() {
    return this.props.email
  }

  get emailVerifiedAt() {
    return this.props.emailVerifiedAt
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

  touch() {
    this.props.updatedAt = new Date()
  }
}
