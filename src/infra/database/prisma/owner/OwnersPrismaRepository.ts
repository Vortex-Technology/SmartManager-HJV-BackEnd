import { Owner } from '@modules/owner/entities/Owner'
import { OwnersRepository } from '@modules/owner/repositories/OwnersRepository'
import { PrismaService } from '../index.service'
import { Injectable } from '@nestjs/common'
import { OwnersPrismaMapper } from './OwnersPrismaMapper'

@Injectable()
export class OwnersPrismaRepository implements OwnersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(owner: Owner): Promise<void> {
    await this.prisma.collaborator.create({
      data: OwnersPrismaMapper.toPrisma(owner),
    })
  }

  async findById(id: string): Promise<Owner | null> {
    const owner = await this.prisma.collaborator.findFirst({
      where: {
        id,
        role: 'OWNER',
      },
    })

    if (!owner) return null

    return OwnersPrismaMapper.toEntity(owner)
  }
}
