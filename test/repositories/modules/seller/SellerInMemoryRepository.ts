import { Seller } from '@modules/seller/entities/Seller'
import { SellerRepository } from '@modules/seller/repositories/SellerRepository'

export class SellerInMemoryRepository implements SellerRepository {
  sellers: Seller[] = []

  async create(seller: Seller): Promise<void> {
    this.sellers.push(seller)
  }

  async findByLogin(login: string): Promise<Seller | null> {
    const seller = this.sellers.find((seller) => seller.login === login)

    if (!seller) return null

    return seller
  }

  async findById(id: string): Promise<Seller | null> {
    const seller = this.sellers.find((seller) => seller.id.toString() === id)

    if (!seller) return null

    return seller
  }
}
