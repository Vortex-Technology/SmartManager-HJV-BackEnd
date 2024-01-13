import { Collaborator } from '@modules/collaborator/entities/Collaborator'
import { CollaboratorsRepository } from '@modules/collaborator/repositories/CollaboratorsRepository'

export class CollaboratorsInMemoryRepository
  implements CollaboratorsRepository
{
  collaborators: Collaborator[] = []

  async findByLogin(login: string): Promise<Collaborator | null> {
    const collaborator = this.collaborators.find(
      (collaborator) => collaborator.login === login,
    )

    if (!collaborator) {
      return null
    }

    return collaborator
  }
}
