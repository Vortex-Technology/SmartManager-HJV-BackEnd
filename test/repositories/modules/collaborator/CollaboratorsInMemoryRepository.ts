import {
  Collaborator,
  CollaboratorRole,
} from '@modules/collaborator/entities/Collaborator'
import {
  CollaboratorsRepository,
  FindManyByMarketIdProps,
} from '@modules/collaborator/repositories/CollaboratorsRepository'

export class CollaboratorsInMemoryRepository
  implements CollaboratorsRepository
{
  collaborators: Collaborator[] = []

  async findByEmail(email: string): Promise<Collaborator | null> {
    const collaborator = this.collaborators.find(
      (collaborator) => collaborator.email === email,
    )

    if (!collaborator) {
      return null
    }

    return collaborator
  }

  async createMany(
    collaborator: Collaborator<CollaboratorRole>[],
  ): Promise<void> {
    this.collaborators.push(...collaborator)
  }

  async findById(id: string): Promise<Collaborator<CollaboratorRole> | null> {
    const collaborator = this.collaborators.find(
      (collaborator) => collaborator.id.toString() === id,
    )

    if (!collaborator) return null

    return collaborator
  }

  async create(collaborator: Collaborator<CollaboratorRole>): Promise<void> {
    this.collaborators.push(collaborator)
  }

  async findManyByMarketId({
    marketId,
    page,
    limit,
  }: FindManyByMarketIdProps): Promise<Collaborator<CollaboratorRole>[]> {
    const collaboratorsOfMarket = this.collaborators.filter(
      (collaborator) => collaborator.marketId.toString() === marketId,
    )

    const collaboratorsInOrd = collaboratorsOfMarket.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    )

    return collaboratorsInOrd.slice((page - 1) * limit, page * limit)
  }

  async countByMarketId(marketId: string): Promise<number> {
    const collaboratorsOfMarket = this.collaborators.filter(
      (collaborator) => collaborator.marketId.toString() === marketId,
    )

    return collaboratorsOfMarket.length
  }
}
