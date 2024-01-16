import { Collaborator } from '../entities/Collaborator'

export abstract class CollaboratorsRepository {
  abstract findByLogin(login: string): Promise<Collaborator | null>
  abstract createMany(collaborator: Collaborator[]): Promise<void>
  abstract create(collaborator: Collaborator): Promise<void>
}
