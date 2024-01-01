import { RefreshAttendantToken } from '../entities/RefreshAttendantToken'

export abstract class RefreshAttendantTokenRepository {
  abstract create(refreshAttendantToken: RefreshAttendantToken): Promise<void>
}
