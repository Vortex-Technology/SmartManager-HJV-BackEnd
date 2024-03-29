import { Collaborator } from '../entities/Collaborator'

export interface FindManyByMarketIdProps {
  marketId: string
  page: number
  limit: number
}

export abstract class CollaboratorsRepository<ConfigT = unknown> {
  abstract findByEmail(email: string): Promise<Collaborator | null>
  abstract findById(id: string): Promise<Collaborator | null>
  abstract createMany(
    collaborator: Collaborator[],
    config?: ConfigT,
  ): Promise<void>

  abstract create(collaborator: Collaborator): Promise<void>
  abstract findManyByMarketId(
    props: FindManyByMarketIdProps,
  ): Promise<Collaborator[]>

  abstract countByMarketId(marketId: string): Promise<number>
}
