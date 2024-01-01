import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'

export interface AttendantProps {
  name: string
  login: string
  password: string
  image: string | null

  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}

export class Attendant extends AggregateRoot<AttendantProps> {
  static create(
    props: Optional<
      AttendantProps,
      'createdAt' | 'updatedAt' | 'deletedAt' | 'image'
    >,
    id?: UniqueEntityId,
  ) {
    const attendantProps: AttendantProps = {
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

    const attendant = new Attendant(attendantProps, id)

    return attendant
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
