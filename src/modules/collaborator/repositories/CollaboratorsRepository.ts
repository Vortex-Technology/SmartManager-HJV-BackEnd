import { Collaborator } from '../entities/Collaborator'

export abstract class CollaboratorsRepository {
  abstract findByLogin(login: string): Promise<Collaborator | null>
}
