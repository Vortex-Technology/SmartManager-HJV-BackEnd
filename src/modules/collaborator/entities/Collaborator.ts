import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'

export enum CollaboratorRole {
  'MASTER' = 'MASTER',
  'OWNER' = 'OWNER',
  'MANAGER' = 'MANAGER',
  'STOCKIST' = 'STOCKIST',
  'SELLER' = 'SELLER',
  'NOT_DEFINED' = 'NOT_DEFINED',
}

export interface CollaboratorProps<
  TRole extends CollaboratorRole = CollaboratorRole,
> {
  name: string
  login: string
  image?: string | null
  password: string
  role: TRole
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}

export type CollaboratorCreatePropsOptional<TRole extends CollaboratorRole> =
  Optional<
    CollaboratorProps<TRole>,
    'image' | 'role' | 'createdAt' | 'updatedAt' | 'deletedAt'
  >

export class Collaborator<
  T extends CollaboratorRole = CollaboratorRole,
> extends AggregateRoot<CollaboratorProps<T>> {
  static create<TRole extends CollaboratorRole = CollaboratorRole>(
    props: CollaboratorCreatePropsOptional<TRole>,
    id?: UniqueEntityId,
  ) {
    const collaboratorProps = Collaborator.setupProps<TRole>(props)
    const collaborator = new Collaborator<TRole>(collaboratorProps, id)
    return collaborator
  }

  static setupProps<TRole extends CollaboratorRole>(
    props: CollaboratorCreatePropsOptional<TRole>,
  ) {
    const collaboratorProps: CollaboratorProps<TRole> = {
      ...props,
      login: props.login
        .normalize('NFD')
        .toLowerCase()
        .replaceAll(' ', '-')
        .replace(/[^\w\s-]/gi, ''),
      image: props.image ?? null,
      role: props.role ?? (CollaboratorRole.NOT_DEFINED as TRole),
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? null,
      deletedAt: props.deletedAt ?? null,
    }

    return collaboratorProps
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

  get role() {
    return this.props.role
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
