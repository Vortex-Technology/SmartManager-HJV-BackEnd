import { RefreshSellerToken } from '../entities/RefreshSellerToken'

export abstract class RefreshSellerTokenRepository {
  abstract create(refreshSellerToken: RefreshSellerToken): Promise<void>
}
