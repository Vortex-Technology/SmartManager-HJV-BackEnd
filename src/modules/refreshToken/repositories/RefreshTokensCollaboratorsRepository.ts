import { RefreshTokenCollaborator } from '../entities/RefreshTokenCollaborator'

export abstract class RefreshTokensCollaboratorsRepository {
  abstract create(
    refreshTokenCollaborator: RefreshTokenCollaborator,
  ): Promise<void>
}
