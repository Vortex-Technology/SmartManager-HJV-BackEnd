import { RefreshToken } from '@modules/refreshToken/entities/RefreshToken'
import { RefreshTokensRepository } from '@modules/refreshToken/repositories/RefreshTokensRepository'

export class RefreshTokensInMemoryRepository
  implements RefreshTokensRepository
{
  refreshTokens: RefreshToken[] = []

  async create(refreshToken: RefreshToken): Promise<void> {
    this.refreshTokens.push(refreshToken)
  }

  async findByCollaboratorIdAndRefreshToken({
    collaboratorId,
    refreshToken,
  }: {
    collaboratorId: string
    refreshToken: string
  }): Promise<RefreshToken | null> {
    const RT = this.refreshTokens.find(
      (RT) =>
        RT.collaboratorId.toString() === collaboratorId &&
        RT.token === refreshToken,
    )

    if (!RT) return null

    return RT
  }

  async permanentlyDeleteByCollaboratorId(
    collaboratorId: string,
  ): Promise<void> {
    this.refreshTokens = this.refreshTokens.filter(
      (RT) => RT.collaboratorId.toString() !== collaboratorId,
    )
  }
}
