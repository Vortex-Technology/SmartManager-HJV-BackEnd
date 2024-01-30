import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'
import { z } from 'zod'
import { ZodEntityValidationPipe } from '@shared/pipes/ZodEntityValidation'


const userPropsSchema = z.object({
  name: z.string().min(2).max(30),
  image: z.string().url().nullable(),
  email: z.string().email(),
  password: z.string().min(8),
  emailVerifiedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
})

const userValidator = new ZodEntityValidationPipe(userPropsSchema)

export type UserProps = z.infer<typeof userPropsSchema>

export class User extends AggregateRoot<UserProps> {
  static create(
    props: Optional<
      UserProps,
      'createdAt' | 'updatedAt' | 'deletedAt' | 'emailVerifiedAt' | 'image'
    >,
    id?: UniqueEntityId,
  ): User {
    const userProps: UserProps = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? null,
      deletedAt: props.deletedAt ?? null,
      emailVerifiedAt: props.emailVerifiedAt ?? null,
      image: props.image ?? null,
    }

    const user = new User(userProps, id)
    user.validate(userValidator)

    return user
  }

  get name() {
    return this.props.name
  }

  set name(name: string) {
    this.props.name = name
    this.touch()
  }

  get image() {
    return this.props.image
  }

  set image(image: string | null) {
    this.props.image = image
    this.touch()
  }

  get email() {
    return this.props.email
  }

  set email(email: string) {
    this.props.email = email
    this.touch()
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
