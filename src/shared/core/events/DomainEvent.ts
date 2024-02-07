import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

/**
 * @interface DomainEvent - Define a domain event interface
 * @prop {Date} OccurredAt - Occurred date
 * @method GetAggregateId - Get aggregate id
 */
export interface DomainEvent {
  ocurredAt: Date
  getAggregateId(): UniqueEntityId
}
