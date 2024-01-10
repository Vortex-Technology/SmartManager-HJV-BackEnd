import { Seller } from '../entities/Seller'

export abstract class SellerRepository {
  abstract create(seller: Seller): Promise<void>
  abstract findByLogin(login: string): Promise<Seller | null>
  abstract findById(id: string): Promise<Seller | null>
  abstract findMany(props: { page: number; limit: number }): Promise<Seller[]>
  abstract count(): Promise<number>
}
