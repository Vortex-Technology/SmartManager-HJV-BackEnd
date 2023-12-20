import { RefreshAdministratorToken } from '@modules/administrator/entities/RefreshAdministratorToken'
import { RefreshAdministratorTokenRepository } from '@modules/administrator/repositories/RefreshAdministratorTokenRepository'

export class RefreshAdministratorTokenInMemoryRepository
  implements RefreshAdministratorTokenRepository
{
  refreshAdministratorTokens: RefreshAdministratorToken[] = []

  async create(
    refreshAdministratorToken: RefreshAdministratorToken,
  ): Promise<void> {
    this.refreshAdministratorTokens.push(refreshAdministratorToken)
  }
}
