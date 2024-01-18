import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'

export interface ApiKeyProps {
  key: string
  secret: string
  revokedAt: Date | null
  companyId: UniqueEntityId
}

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
