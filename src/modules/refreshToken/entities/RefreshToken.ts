import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'
import { z } from 'zod'
import { ZodEntityValidationPipe } from '@shared/pipes/ZodEntityValidation'

const refreshTokenPropsSchema = z.object({
  token: z.string(),
  expiresIn: z.date(),
  expiredAt: z.date().nullable(),
  createdAt: z.date(),
  userId: z.instanceof(UniqueEntityId),
})

const refreshTokenValidationPipe = new ZodEntityValidationPipe(
  refreshTokenPropsSchema,
)

export type RefreshTokenProps = z.infer<typeof refreshTokenPropsSchema>

export class RefreshToken extends AggregateRoot<RefreshTokenProps> {
  static create(
    props: Optional<RefreshTokenProps, 'expiredAt' | 'createdAt'>,
    id?: UniqueEntityId,
  ) {
    const refreshTokenProps: RefreshTokenProps = {
      ...props,
      expiredAt: props.expiredAt ?? null,
      createdAt: props.createdAt ?? new Date(),
    }

    const refreshToken = new RefreshToken(refreshTokenProps, id)
    refreshToken.validate(refreshTokenValidationPipe)

    return refreshToken
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

  get userId() {
    return this.props.userId
  }
}
