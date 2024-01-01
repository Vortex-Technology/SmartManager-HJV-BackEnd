import { Attendant } from '@modules/attendant/entities/Attendant'
import { AttendantRepository } from '@modules/attendant/repositories/AttendantRepository'

export class AttendantInMemoryRepository implements AttendantRepository {
  attendants: Attendant[] = []

  async create(attendant: Attendant): Promise<void> {
    this.attendants.push(attendant)
  }

  async findByLogin(login: string): Promise<Attendant | null> {
    const attendant = this.attendants.find(
      (attendant) => attendant.login === login,
    )

    if (!attendant) return null

    return attendant
  }
}
