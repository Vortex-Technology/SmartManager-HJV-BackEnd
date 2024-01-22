import { RefreshToken } from '../entities/RefreshToken'

export abstract class RefreshTokensRepository {
  abstract create(refreshToken: RefreshToken): Promise<void>
  abstract findByUserIdAndRefreshToken(props: {
    userId: string
    refreshToken: string
  }): Promise<RefreshToken | null>

  abstract permanentlyDeleteByUserId(userId: string): Promise<void>
}
