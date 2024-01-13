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
    const masterProps = Collaborator.setupProps<TRole>(props)
    const master = new Master(
      { ...masterProps, role: CollaboratorRole.MASTER },
      id,
    )

    return master
  }
}
