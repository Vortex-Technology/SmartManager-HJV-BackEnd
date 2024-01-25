import { Injectable } from '@nestjs/common'
import {
  PrismaConfig,
  PrismaService,
} from '@infra/database/prisma/index.service'
import { TransactorService } from '../contracts/TransactorService'
import { Transaction, Transactor } from '../entities/Transactor'

@Injectable()
export class TransactorManager implements TransactorService<PrismaConfig> {
  constructor(private readonly prisma: PrismaService) {}

  start(): Transactor<PrismaConfig> {
    return Transactor.create<PrismaConfig>({
      transactions: [],
    })
  }

  async execute(transactor: Transactor<PrismaConfig>): Promise<unknown[]> {
    const responses: unknown[] = []

    async function executeTransactions(
      transactions: Transaction<PrismaConfig>[],
      config: PrismaConfig,
    ) {
      const transaction = transactions.shift()

      if (transaction) {
        const result = await transaction(config)
        responses.push(result)
        await executeTransactions(transactions, config)
      }
    }

    return await this.prisma.$transaction(async (prisma) => {
      await executeTransactions(transactor.transactions, { prisma })
      return responses
    })
  }
}
