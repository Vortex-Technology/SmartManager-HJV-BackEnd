import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'
import { z } from 'zod'
import { ZodValidationPipe } from '@shared/pipes/ZodValidation'

const refreshTokenCollaboratorPropsSchema = z.object({
  token: z.string(),
  expiresIn: z.date(),
  expiredAt: z.date().nullable(),
  createdAt: z.date(),
  companyId: z.instanceof(UniqueEntityId),
  marketId: z.instanceof(UniqueEntityId),
  collaboratorId: z.instanceof(UniqueEntityId),
  apiKeyId: z.instanceof(UniqueEntityId),
})

const refreshTokenCollaboratorValidationPipe = new ZodValidationPipe(
  refreshTokenCollaboratorPropsSchema,
)

export type RefreshTokenCollaboratorProps = z.infer<
  typeof refreshTokenCollaboratorPropsSchema
>

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

    refreshTokenCollaborator.validate(refreshTokenCollaboratorValidationPipe)

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
