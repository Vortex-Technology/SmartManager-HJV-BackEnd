import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'

export enum AdministratorRole {
  MASTER = 'MASTER',
  FULL_ACCESS = 'FULL_ACCESS',
  CREATOR = 'CREATOR',
  VIEWER = 'VIEWER',
}

export interface AdministratorProps {
  name: string
  login: string
  image?: string | null
  password: string
  role: AdministratorRole
}

export class Administrator extends AggregateRoot<AdministratorProps> {
  static create(
    props: Optional<AdministratorProps, 'image' | 'role'>,
    id?: UniqueEntityId,
  ) {
    const administratorProps: AdministratorProps = {
      ...props,
      login: props.login
        .normalize('NFD')
        .toLowerCase()
        .replaceAll(' ', '-')
        .replace(/[^\w\s-]/gi, ''),
      image: props.image ?? null,
      role: props.role ?? AdministratorRole.FULL_ACCESS,
    }

    const administrator = new Administrator(administratorProps, id)

    return administrator
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
}
