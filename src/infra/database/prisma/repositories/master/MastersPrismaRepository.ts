import { MastersRepository } from '@modules/master/repositories/MastersRepository'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../index.service'
import { Master } from '@modules/master/entities/Master'
import { MastersPrismaMapper } from './MastersPrismaMapper'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'

@Injectable()
export class MastersPrismaRepository implements MastersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Master | null> {
    const master = await this.prisma.collaborator.findUnique({
      where: {
        id,
        role: CollaboratorRole.MASTER,
        deletedAt: null,
      },
    })

    if (!master) return null

    return MastersPrismaMapper.toEntity(master)
  }
}
