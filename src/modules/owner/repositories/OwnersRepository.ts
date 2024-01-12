import { Owner } from '../entities/Owner'

export abstract class OwnersRepository {
  abstract findByLogin(login: string): Promise<Owner | null>
  abstract create(owner: Owner): Promise<void>
}
