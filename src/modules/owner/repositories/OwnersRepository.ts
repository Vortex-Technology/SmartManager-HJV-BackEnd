import { Owner } from '../entities/Owner'

export abstract class OwnersRepository {
  abstract create(owner: Owner): Promise<void>
  abstract findById(id: string): Promise<Owner | null>
}
