import { RefreshAttendantToken } from '@modules/attendant/entities/RefreshAttendantToken'
import { RefreshAttendantTokenRepository } from '@modules/attendant/repositories/RefreshAttendantTokenRepository'

export class RefreshAttendantTokenInMemoryRepository
  implements RefreshAttendantTokenRepository
{
  refreshAttendantTokens: RefreshAttendantToken[] = []

  async create(refreshAttendantToken: RefreshAttendantToken): Promise<void> {
    this.refreshAttendantTokens.push(refreshAttendantToken)
  }
}
