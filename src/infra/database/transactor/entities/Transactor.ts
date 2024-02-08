import { Entity } from '@shared/core/entities/Entity'

/**
 * @type Transaction - Define a transactions
 * @template T - Type of context execution in transaction
 */
export type Transaction<T = unknown> = (executionContext?: T) => Promise<void>

export interface TransactorProps<T = unknown> {
  transactions: Transaction<T>[]
}

/**
 * @class Transactor - Class that defines a transactions
 * @template T - Type of context execution in transaction
 * @extends {Entity<TransactorProps<T>>}
 */
export class Transactor<T = unknown> extends Entity<TransactorProps<T>> {
  static create<T = unknown>(props: TransactorProps<T>): Transactor<T> {
    return new Transactor<T>(props)
  }

  get transactions() {
    return this.props.transactions
  }

  /**
   * add - Add a transaction to the list of transactions
   * @prop {Transaction<T>} transaction - A transaction to be added
   * @see {@link Transaction}
   */
  add(transaction: Transaction<T>): void {
    this.props.transactions.push(transaction)
  }
}
