import { Injectable } from '@nestjs/common'
import { PrismaService } from '../index.service'
import { RefreshToken } from '@modules/refreshToken/entities/RefreshToken'
import { RefreshTokensPrismaMapper } from './RefreshTokensPrismaMapper'
import { RefreshTokensRepository } from '@modules/refreshToken/repositories/RefreshTokensRepository'

@Injectable()
export class RefreshTokensPrismaRepository implements RefreshTokensRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(refreshToken: RefreshToken): Promise<void> {
    await this.prisma.refreshToken.create({
      data: RefreshTokensPrismaMapper.toPrisma(refreshToken),
    })
  }

  async findByUserIdAndRefreshToken(props: {
    userId: string
    refreshToken: string
  }): Promise<RefreshToken | null> {
    const refreshToken = await this.prisma.refreshToken.findFirst({
      where: {
        userId: props.userId,
        token: props.refreshToken,
      },
    })

    if (!refreshToken) return null

    return RefreshTokensPrismaMapper.toEntity(refreshToken)
  }

  async permanentlyDeleteByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
      },
    })
  }
}
