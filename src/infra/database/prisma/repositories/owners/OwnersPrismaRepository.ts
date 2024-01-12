import { OwnersRepository } from '@modules/owner/repositories/OwnersRepository'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../index.service'
import { Owner } from '@modules/owner/entities/Owner'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { OwnersPrismaMapper } from './OwnersPrismaMapper'

@Injectable()
export class OwnersPrismaRepository implements OwnersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByLogin(login: string): Promise<Owner | null> {
    const owner = await this.prisma.collaborator.findFirst({
      where: {
        login,
        role: CollaboratorRole.OWNER,
        deletedAt: null,
      },
    })

    if (!owner) return null

    return OwnersPrismaMapper.toEntity(owner)
  }

  async create(owner: Owner): Promise<void> {
    await this.prisma.collaborator.create({
      data: OwnersPrismaMapper.toPrisma(owner),
    })
  }
}
