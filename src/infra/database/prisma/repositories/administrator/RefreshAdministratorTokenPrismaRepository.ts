import { RefreshAdministratorToken } from '@modules/administrator/entities/RefreshAdministratorToken'
import { RefreshAdministratorTokenRepository } from '@modules/administrator/repositories/RefreshAdministratorTokenRepository'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../index.service'
import { RefreshAdministratorTokenPrismaMapper } from './RefreshAdministratorTokenPrismaMapper'

@Injectable()
export class RefreshAdministratorTokenPrismaRepository
  implements RefreshAdministratorTokenRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(
    refreshAdministratorToken: RefreshAdministratorToken,
  ): Promise<void> {
    await this.prisma.refreshToken.create({
      data: RefreshAdministratorTokenPrismaMapper.toPrisma(
        refreshAdministratorToken,
      ),
    })
  }
}
