import { RefreshSellerToken } from '@modules/seller/entities/RefreshSellerToken'
import { RefreshSellerTokenRepository } from '@modules/seller/repositories/RefreshSellerTokenRepository'

export class RefreshSellerTokenInMemoryRepository
  implements RefreshSellerTokenRepository
{
  refreshSellerTokens: RefreshSellerToken[] = []

  async create(refreshSellerToken: RefreshSellerToken): Promise<void> {
    this.refreshSellerTokens.push(refreshSellerToken)
  }
}
