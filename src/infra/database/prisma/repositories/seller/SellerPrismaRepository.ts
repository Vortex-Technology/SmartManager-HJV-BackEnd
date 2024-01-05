import { Seller } from '@modules/seller/entities/Seller'
import { SellerRepository } from '@modules/seller/repositories/SellerRepository'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../index.service'
import { SellerPrismaMapper } from './SellerPrismaMapper'

@Injectable()
export class SellerPrismaRepository implements SellerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(seller: Seller): Promise<void> {
    await this.prisma.collaborator.create({
      data: SellerPrismaMapper.toPrisma(seller),
    })
  }

  async findByLogin(login: string): Promise<Seller | null> {
    const seller = await this.prisma.collaborator.findUnique({
      where: {
        login,
        deletedAt: null,
      },
    })

    if (!seller) return null

    return SellerPrismaMapper.toEntity(seller)
  }

  async findById(id: string): Promise<Seller | null> {
    const seller = await this.prisma.collaborator.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!seller) return null

    return SellerPrismaMapper.toEntity(seller)
  }
}
