import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'
import { z } from 'zod'
import { ZodEntityValidationPipe } from '@shared/pipes/ZodEntityValidation'

const apiKeyPropsSchema = z.object({
  key: z.string(),
  secret: z.string(),
  revokedAt: z.date().nullable(),
  companyId: z.instanceof(UniqueEntityId),
})

const apiKeyValidationPipe = new ZodEntityValidationPipe(apiKeyPropsSchema)

export type ApiKeyProps = z.infer<typeof apiKeyPropsSchema>

export class ApiKey extends AggregateRoot<ApiKeyProps> {
  static create(
    props: Optional<ApiKeyProps, 'revokedAt'>,
    id?: UniqueEntityId,
  ) {
    const apiKeyProps: ApiKeyProps = {
      ...props,
      revokedAt: props.revokedAt ?? null,
    }

    const apiKey = new ApiKey(apiKeyProps, id)
    apiKey.validate(apiKeyValidationPipe)

    return apiKey
  }

  get key() {
    return this.props.key
  }

  get secret() {
    return this.props.secret
  }

  get revokedAt() {
    return this.props.revokedAt
  }

  get companyId() {
    return this.props.companyId
  }
}
