import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'

export enum CollaboratorRole {
  'OWNER' = 'OWNER',
  'MANAGER' = 'MANAGER',
  'STOCKIST' = 'STOCKIST',
  'SELLER' = 'SELLER',
  'NOT_DEFINED' = 'NOT_DEFINED',
}

export interface CollaboratorProps<
  TRole extends CollaboratorRole = CollaboratorRole,
> {
  email: string
  password: string
  actualRemuneration: number
  role: TRole
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
  inactivatedAt: Date | null
  marketId: UniqueEntityId | null
  companyId: UniqueEntityId | null
  userId: UniqueEntityId
}

export type CollaboratorCreateUntypedPropsOptional<
  TRole extends CollaboratorRole,
> = Optional<
  CollaboratorProps<TRole>,
  | 'createdAt'
  | 'deletedAt'
  | 'updatedAt'
  | 'inactivatedAt'
  | 'role'
  | 'companyId'
  | 'marketId'
>

export type CollaboratorCreateOwnerPropsOptional<
  TRole extends CollaboratorRole,
> = Optional<
  CollaboratorProps<TRole>,
  | 'createdAt'
  | 'deletedAt'
  | 'updatedAt'
  | 'inactivatedAt'
  | 'role'
  | 'marketId'
>

export type CollaboratorCreatePropsOptional<TRole extends CollaboratorRole> =
  Optional<
    CollaboratorProps<TRole>,
    | 'createdAt'
    | 'deletedAt'
    | 'updatedAt'
    | 'inactivatedAt'
    | 'role'
    | 'companyId'
  >

export class Collaborator<
  T extends CollaboratorRole = CollaboratorRole,
> extends AggregateRoot<CollaboratorProps<T>> {
  static createUntyped<TRole extends CollaboratorRole = CollaboratorRole>(
    props: CollaboratorCreateUntypedPropsOptional<TRole>,
    id?: UniqueEntityId,
  ) {
    const collaboratorProps = Collaborator.setupProps<TRole>(props)
    const collaborator = new Collaborator<TRole>(collaboratorProps, id)
    return collaborator
  }

  static setupProps<TRole extends CollaboratorRole>(
    props: CollaboratorCreateUntypedPropsOptional<TRole>,
  ) {
    const collaboratorProps: CollaboratorProps<TRole> = {
      ...props,
      role: props.role ?? (CollaboratorRole.NOT_DEFINED as TRole),
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? null,
      deletedAt: props.deletedAt ?? null,
      inactivatedAt: props.inactivatedAt ?? null,
      marketId: props.marketId ?? null,
      companyId: props.companyId ?? null,
    }

    return collaboratorProps
  }

  get email() {
    return this.props.email
  }

  get password() {
    return this.props.password
  }

  get actualRemuneration() {
    return this.props.actualRemuneration
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

  get inactivatedAt() {
    return this.props.inactivatedAt
  }

  set inactivatedAt(inactivatedAt: Date | null) {
    this.props.inactivatedAt = inactivatedAt
    this.touch()
  }

  get marketId() {
    return this.props.marketId
  }

  get companyId() {
    return this.props.companyId
  }

  get userId() {
    return this.props.userId
  }

  touch() {
    this.props.updatedAt = new Date()
  }

  // public equals(entity: Collaborator): boolean {
  //   if (entity instanceof Collaborator) {
  //     return entity.id.equals(this.id) && entity.props.role === this.props.role
  //   }

  //   return false
  // }
}
