import { Owner } from '@modules/owner/entities/Owner'
import { OwnersRepository } from '@modules/owner/repositories/OwnersRepository'

export class OwnersInMemoryRepository implements OwnersRepository {
  owners: Owner[] = []

  async findByLogin(login: string): Promise<Owner | null> {
    const owner = this.owners.find((owner) => owner.login === login)

    if (!owner) {
      return null
    }

    return owner
  }

  async create(owner: Owner): Promise<void> {
    this.owners.push(owner)
  }
}
