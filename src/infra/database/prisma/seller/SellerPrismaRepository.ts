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

  async findMany({
    page,
    limit,
  }: {
    page: number
    limit: number
  }): Promise<Seller[]> {
    const sellers = await this.prisma.collaborator.findMany({
      where: {
        deletedAt: null,
        type: 'SELLER',
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    return sellers.map(SellerPrismaMapper.toEntity)
  }

  async count(): Promise<number> {
    return await this.prisma.collaborator.count({
      where: {
        deletedAt: null,
        type: 'SELLER',
      },
    })
  }
}
