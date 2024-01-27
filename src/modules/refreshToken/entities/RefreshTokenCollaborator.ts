import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'

export interface RefreshTokenCollaboratorProps {
  token: string
  expiresIn: Date
  expiredAt: Date | null
  createdAt: Date
  companyId: UniqueEntityId
  marketId: UniqueEntityId
  apiKeyId: UniqueEntityId
  collaboratorId: UniqueEntityId
}

export class RefreshTokenCollaborator extends AggregateRoot<RefreshTokenCollaboratorProps> {
  static create(
    props: Optional<RefreshTokenCollaboratorProps, 'expiredAt' | 'createdAt'>,
    id?: UniqueEntityId,
  ) {
    const refreshTokenCollaboratorProps: RefreshTokenCollaboratorProps = {
      ...props,
      expiredAt: props.expiredAt ?? null,
      createdAt: props.createdAt ?? new Date(),
    }

    const refreshTokenCollaborator = new RefreshTokenCollaborator(
      refreshTokenCollaboratorProps,
      id,
    )

    return refreshTokenCollaborator
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

  get companyId() {
    return this.props.companyId
  }

  get marketId() {
    return this.props.marketId
  }

  get collaboratorId() {
    return this.props.collaboratorId
  }

  get apiKeyId() {
    return this.props.apiKeyId
  }
}
