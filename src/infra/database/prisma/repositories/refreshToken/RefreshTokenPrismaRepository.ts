import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../index.service'
import { RefreshTokenPrismaMapper } from './RefreshTokenPrismaMapper'
import { RefreshTokenRepository } from '@modules/refreshToken/repositories/RefreshTokenRepository'
import { RefreshToken } from '@modules/refreshToken/entities/RefreshToken'

@Injectable()
export class RefreshTokenPrismaRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(refreshToken: RefreshToken): Promise<void> {
    await this.prisma.refreshToken.create({
      data: RefreshTokenPrismaMapper.toPrisma(refreshToken),
    })
  }

  async findByCollaboratorIdAndRefreshToken(props: {
    collaboratorId: string
    refreshToken: string
  }): Promise<RefreshToken | null> {
    const refreshToken = await this.prisma.refreshToken.findFirst({
      where: {
        collaboratorId: props.collaboratorId,
        token: props.refreshToken,
      },
    })

    if (!refreshToken) {
      return null
    }

    return RefreshTokenPrismaMapper.toEntity(refreshToken)
  }

  async permanentlyDeleteByCollaboratorId(
    collaboratorId: string,
  ): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        collaboratorId,
      },
    })
  }
}
