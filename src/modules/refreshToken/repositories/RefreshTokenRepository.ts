import { RefreshToken } from '../entities/RefreshToken'

export abstract class RefreshTokenRepository {
  abstract create(refreshToken: RefreshToken): Promise<void>
  abstract findByCollaboratorIdAndRefreshToken(props: {
    collaboratorId: string
    refreshToken: string
  }): Promise<RefreshToken | null>

  abstract permanentlyDeleteByCollaboratorId(
    collaboratorId: string,
  ): Promise<void>
}
