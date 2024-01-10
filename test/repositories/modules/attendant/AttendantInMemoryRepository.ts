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

  async findById(id: string): Promise<Attendant | null> {
    const attendant = this.attendants.find(
      (attendant) => attendant.id.toString() === id,
    )

    if (!attendant) return null

    return attendant
  }

  async findMany({
    limit,
    page,
  }: {
    page: number
    limit: number
  }): Promise<Attendant[]> {
    return this.attendants
      .filter((administrator) => !administrator.deletedAt)
      .slice((page - 1) * limit, page * limit)
  }

  async count(): Promise<number> {
    return this.attendants.length
  }
}
