import { RefreshTokenCollaborator } from '@modules/refreshToken/entities/RefreshTokenCollaborator'
import { RefreshTokensCollaboratorsRepository } from '@modules/refreshToken/repositories/RefreshTokensCollaboratorsRepository'

export class RefreshTokensCollaboratorsInMemoryRepository
  implements RefreshTokensCollaboratorsRepository
{
  refreshTokenCollaborators: RefreshTokenCollaborator[] = []

  async create(
    refreshTokenCollaborator: RefreshTokenCollaborator,
  ): Promise<void> {
    this.refreshTokenCollaborators.push(refreshTokenCollaborator)
  }
}
