import { Injectable } from '@nestjs/common'
import { PrismaService } from '../index.service'
import { Seller } from '@modules/seller/entities/Seller'
import { SellersRepository } from '@modules/seller/repositories/SellersRepository'
import { SellersPrismaMapper } from './SellersPrismaMapper'

@Injectable()
export class SellersPrismaRepository implements SellersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(seller: Seller): Promise<void> {
    await this.prisma.collaborator.create({
      data: SellersPrismaMapper.toPrisma(seller),
    })
  }

  async findById(id: string): Promise<Seller | null> {
    const seller = await this.prisma.collaborator.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!seller) return null

    return SellersPrismaMapper.toEntity(seller)
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
        role: 'SELLER',
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    return sellers.map(SellersPrismaMapper.toEntity)
  }

  async count(): Promise<number> {
    return await this.prisma.collaborator.count({
      where: {
        deletedAt: null,
        role: 'SELLER',
      },
    })
  }
}
