import { TransactorService } from '@infra/database/transactor/contracts/TransactorService'
import {
  Transaction,
  Transactor,
} from '@infra/database/transactor/entities/Transactor'

export class FakeTransactor implements TransactorService {
  async execute(transactor: Transactor<unknown>): Promise<unknown[]> {
    async function executeTransactions(transactions: Transaction[]) {
      const transaction = transactions.shift()

      if (transaction) {
        await transaction()
        await executeTransactions(transactions)
      }
    }

    await executeTransactions(transactor.transactions)

    return []
  }

  start(): Transactor<unknown> {
    return Transactor.create({
      transactions: [],
    })
  }
}
