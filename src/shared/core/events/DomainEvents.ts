import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { DomainEvent } from './DomainEvent'

/**
 * @type DomainEventCallback - Define a type of event callback
 */
type DomainEventCallback = (event: unknown) => void

/**
 * @type HandlersMap - Define a type of handlers map. It will be map one value to one event to be handled
 */
type HandlersMap = Record<string, DomainEventCallback[]>

/**
 * @class DomainEvents - Domain events store all domain events to dispatch this when needed
 * @prop {HandlersMap}
 * @prop {AggregateRoot[]} markedAggregates - Store all aggregates to be dispatched
 */
export class DomainEvents {
  private static handlersMap: HandlersMap = {}
  private static markedAggregates: AggregateRoot<unknown>[] = []

  /**
   * markAggregateForDispatch - Mark an aggregate to be dispatched
   * @prop {AggregateRoot} aggregate - Aggregate to be marked to be dispatched
   */
  public static markAggregateForDispatch(aggregate: AggregateRoot<unknown>) {
    const aggregateFound = !!this.findMarkedAggregateByID(aggregate.id)

    if (!aggregateFound) {
      this.markedAggregates.push(aggregate)
    }
  }

  /**
   * dispatchAggregateEvents - Dispatch all events of an aggregate
   * @prop {AggregateRoot} aggregate - Aggregate to be dispatc events
   */
  private static dispatchAggregateEvents(aggregate: AggregateRoot<unknown>) {
    aggregate.domainEvents.forEach((event: DomainEvent) => this.dispatch(event))
  }

  /**
   * removeAggregateFromMarkedDispatchList - Remove an aggregate from dispatched list
   * @prop {AggregateRoot} aggregate - Aggregate to be removed
   */
  private static removeAggregateFromMarkedDispatchList(
    aggregate: AggregateRoot<unknown>,
  ) {
    const index = this.markedAggregates.findIndex((a) => a.equals(aggregate))

    this.markedAggregates.splice(index, 1)
  }

  /**
   * findMarkedAggregateByID - Find an aggregate by id
   * @prop {UniqueEntityId} id - Id of the aggregate to be found
   */
  private static findMarkedAggregateByID(
    id: UniqueEntityId,
  ): AggregateRoot<unknown> | undefined {
    return this.markedAggregates.find((aggregate) => aggregate.id.equals(id))
  }

  /**
   * dispatchEventsForAggregate - Dispatch events for an aggregate
   * @prop {UniqueEntityId} id - Id of the aggregate to be dispatched
   */
  public static dispatchEventsForAggregate(id: UniqueEntityId) {
    const aggregate = this.findMarkedAggregateByID(id)

    if (aggregate) {
      this.dispatchAggregateEvents(aggregate)
      aggregate.clearEvents()
      this.removeAggregateFromMarkedDispatchList(aggregate)
    }
  }

  /**
   * register - Register an event handler
   * @prop {DomainEventCallback} callback - Callback to be registered
   * @prop {string} eventClassName - Class name of the event
   */
  public static register(
    callback: DomainEventCallback,
    eventClassName: string,
  ) {
    const wasEventRegisteredBefore = eventClassName in this.handlersMap

    if (!wasEventRegisteredBefore) {
      this.handlersMap[eventClassName] = []
    }

    this.handlersMap[eventClassName].push(callback)
  }

  /**
   * clearHandlers - Clear all handlers
   */
  public static clearHandlers() {
    this.handlersMap = {}
  }

  /**
   * clearMarkedAggregates - Clear all marked aggregates
   */
  public static clearMarkedAggregates() {
    this.markedAggregates = []
  }

  /**
   * dispatch - Dispatch an event
   * @prop {DomainEvent} event - Event to be dispatched
   */
  private static dispatch(event: DomainEvent) {
    const eventClassName: string = event.constructor.name

    const isEventRegistered = eventClassName in this.handlersMap

    if (isEventRegistered) {
      const handlers = this.handlersMap[eventClassName]

      handlers.forEach((handler) => handler(event))
    }
  }
}
