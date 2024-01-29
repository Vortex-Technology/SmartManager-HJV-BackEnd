import { Injectable } from '@nestjs/common'
import { PrismaService } from '../index.service'
import { RefreshTokensCollaboratorsRepository } from '@modules/refreshToken/repositories/RefreshTokensCollaboratorsRepository'
import { RefreshTokenCollaborator } from '@modules/refreshToken/entities/RefreshTokenCollaborator'
import { RefreshTokensCollaboratorsPrismaMapper } from './RefreshTokensCollaboratorsPrismaMapper'

@Injectable()
export class RefreshTokensCollaboratorsPrismaRepository
  implements RefreshTokensCollaboratorsRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(
    refreshTokenCollaborator: RefreshTokenCollaborator,
  ): Promise<void> {
    await this.prisma.refreshTokenCollaborator.create({
      data: RefreshTokensCollaboratorsPrismaMapper.toPrisma(
        refreshTokenCollaborator,
      ),
    })
  }
}
