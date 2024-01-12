import {
  Collaborator,
  CollaboratorCreatePropsOptional,
  CollaboratorRole,
} from '@modules/collaborator/entities/Collaborator'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export class Master extends Collaborator<CollaboratorRole.MASTER> {
  static create<TRole extends CollaboratorRole = CollaboratorRole.MASTER>(
    props: CollaboratorCreatePropsOptional<TRole>,
    id?: UniqueEntityId,
  ) {
    const master = Collaborator.create<TRole>(
      {
        ...props,
        role: CollaboratorRole.MASTER as TRole,
      },
      id,
    )

    return master
  }
}
