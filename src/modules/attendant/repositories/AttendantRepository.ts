import { Attendant } from '../entities/Attendant'

export abstract class AttendantRepository {
  abstract create(attendant: Attendant): Promise<void>
  abstract findByLogin(login: string): Promise<Attendant | null>
  abstract findById(id: string): Promise<Attendant | null>
  abstract findMany(props: {
    page: number
    limit: number
  }): Promise<Attendant[]>

  abstract count(): Promise<number>
}
