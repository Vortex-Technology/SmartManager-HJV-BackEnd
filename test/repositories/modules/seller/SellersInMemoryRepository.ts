import { Seller } from '@modules/seller/entities/Seller'
import { SellersRepository } from '@modules/seller/repositories/SellersRepository'

export class SellersInMemoryRepository implements SellersRepository {
  sellers: Seller[] = []

  async create(seller: Seller): Promise<void> {
    this.sellers.push(seller)
  }

  async findById(id: string): Promise<Seller | null> {
    const seller = this.sellers.find((seller) => seller.id.toString() === id)

    if (!seller) return null

    return seller
  }

  async findMany({
    limit,
    page,
  }: {
    page: number
    limit: number
  }): Promise<Seller[]> {
    return this.sellers
      .filter((administrator) => !administrator.deletedAt)
      .slice((page - 1) * limit, page * limit)
  }

  async count(): Promise<number> {
    return this.sellers.length
  }
}
