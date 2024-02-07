import { Transactor } from '../entities/Transactor'

/**
 * @class TransactorService - Defines a transaction service. It will be used to call functions of the repositories using transactional methods
 * @template T - Define the type of exection context on transaction
 */
export abstract class TransactorService<T = unknown> {
  /**
   * start - Will start the transactor
   */
  abstract start(): Transactor<T>

  /**
   * execute - Will execute a Transactor
   * @prop {Transactor} - The same Transactor at initialized with the start method
   *
   * ---
   * It will execute all transactions in the Transactor in sequence, respecting the order of items is added [FIFO]. If one broke, all of them will be rolledback
   */
  abstract execute(transactor: Transactor<T>): Promise<unknown[]>
}
