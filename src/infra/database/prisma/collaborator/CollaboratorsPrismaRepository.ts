import { CollaboratorsRepository } from '@modules/collaborator/repositories/CollaboratorsRepository'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../index.service'
import { Collaborator } from '@modules/collaborator/entities/Collaborator'
import { CollaboratorsPrismaMapper } from './CollaboratorsPrismaMapper'

@Injectable()
export class CollaboratorsPrismaRepository implements CollaboratorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByLogin(login: string): Promise<Collaborator | null> {
    const collaborator = await this.prisma.collaborator.findUnique({
      where: {
        login,
        deletedAt: null,
      },
    })

    if (!collaborator) return null

    return CollaboratorsPrismaMapper.toEntity(collaborator)
  }
}
