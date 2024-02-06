import { DomainEvent } from '@shared/core/events/DomainEvent'
import { DomainEvents } from '@shared/core/events/DomainEvents'
import { Entity } from './Entity'

/**
 *  @class AggregateRoot
 *  @template TypeProps - The type of the entity props
 *
 *  This class represents an aggregate root. An aggregate root is an object ussed to define an relationship between entities. It provides a way to apply domain events to entities and allows for a more decoupled architecture, enabling to apply domain events to entities in different contexts.
 *  By default, it extends the Entity class, so if you need define a new entity, you can do it with this class for more flexibility.
 */
export abstract class AggregateRoot<TypeProps> extends Entity<TypeProps> {
  private _domainEvents: DomainEvent[] = []

  /**
   * domainEvents
   *
   * @returns {DomainEvent[]} domainEvents - A list of domain events
   */
  get domainEvents(): DomainEvent[] {
    return this._domainEvents
  }

  /**
   * addDomainEvent
   *
   * @prop {DomainEvent} domainEvent - The domain event to be added
   */
  protected addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent)
    DomainEvents.markAggregateForDispatch(this)
  }

  /**
   * clearEvents
   *
   * Method to clear the domain events
   */
  public clearEvents() {
    this._domainEvents = []
  }
}
