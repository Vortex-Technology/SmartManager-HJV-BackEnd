import { OwnersRepository } from '@modules/owner/repositories/OwnersRepository'
import { CollaboratorsInMemoryRepository } from '../collaborator/CollaboratorsInMemoryRepository'
import { Owner } from '@modules/owner/entities/Owner'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'

export class OwnersInMemoryRepository implements OwnersRepository {
  constructor(
    private readonly collaboratorsInMemoryRepository: CollaboratorsInMemoryRepository,
  ) {}

  owners: Owner[] = []

  async create(owner: Owner): Promise<void> {
    await this.collaboratorsInMemoryRepository.create(owner)
    this.setOwners()
  }

  async findById(id: string): Promise<Owner | null> {
    const owner = this.owners.find((owner) => owner.id.toString() === id)

    if (!owner) return null

    return owner
  }

  private setOwners() {
    this.owners = this.collaboratorsInMemoryRepository.collaborators.filter(
      (c) => c.role === CollaboratorRole.OWNER,
    ) as Owner[]
  }
}
