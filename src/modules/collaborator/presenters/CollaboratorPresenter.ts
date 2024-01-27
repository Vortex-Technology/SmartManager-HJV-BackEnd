import { Collaborator } from '../entities/Collaborator'

export class CollaboratorPresenter {
  static toHTTP(collaborator: Collaborator) {
    return {
      id: collaborator.id.toString(),
      email: collaborator.email,
      role: collaborator.role,
      marketId: collaborator.marketId?.toString(),
      companyId: collaborator.companyId?.toString(),
      createdAt: collaborator.createdAt,
      updatedAt: collaborator.updatedAt,
      deletedAt: collaborator.deletedAt,
      inactivatedAt: collaborator.inactivatedAt,
      actualRemuneration: collaborator.actualRemuneration,
    }
  }
}
