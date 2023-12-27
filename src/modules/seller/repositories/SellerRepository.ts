import { Seller } from '../entities/Seller'

export abstract class SellerRepository {
  abstract create(seller: Seller): Promise<void>
  abstract findByLogin(login: string): Promise<Seller | null>
}
