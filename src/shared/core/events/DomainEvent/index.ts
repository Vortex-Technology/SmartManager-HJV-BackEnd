import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

export interface DomainEvent {
  ocurredAt: Date
  getAggregateId(): UniqueEntityId
}
