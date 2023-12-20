import { RefreshAdministratorToken } from '../entities/RefreshAdministratorToken'

export abstract class RefreshAdministratorTokenRepository {
  abstract create(
    refreshAdministratorToken: RefreshAdministratorToken,
  ): Promise<void>
}
