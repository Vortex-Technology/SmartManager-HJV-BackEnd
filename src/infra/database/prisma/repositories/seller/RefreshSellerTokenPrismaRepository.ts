import { RefreshSellerToken } from '@modules/seller/entities/RefreshSellerToken'
import { RefreshSellerTokenRepository } from '@modules/seller/repositories/RefreshSellerTokenRepository'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../index.service'
import { RefreshSellerTokenPrismaMapper } from './RefreshSellerTokenPrismaMapper'

@Injectable()
export class RefreshSellerTokenPrismaRepository
  implements RefreshSellerTokenRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(refreshSellerToken: RefreshSellerToken): Promise<void> {
    await this.prisma.refreshToken.create({
      data: RefreshSellerTokenPrismaMapper.toPrisma(refreshSellerToken),
    })
  }
}
