import { Seller } from '../entities/Seller'

export abstract class SellersRepository {
  abstract create(seller: Seller): Promise<void>
  abstract findById(id: string): Promise<Seller | null>
  abstract findMany(props: { page: number; limit: number }): Promise<Seller[]>
  abstract count(): Promise<number>
}
