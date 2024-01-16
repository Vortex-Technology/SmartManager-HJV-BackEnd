import {
  Collaborator,
  CollaboratorCreatePropsOptional,
  CollaboratorRole,
} from '@modules/collaborator/entities/Collaborator'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export class Owner extends Collaborator<CollaboratorRole.OWNER> {
  static create<TRole extends CollaboratorRole = CollaboratorRole.OWNER>(
    props: CollaboratorCreatePropsOptional<TRole>,
    id?: UniqueEntityId,
  ) {
    const ownerProps = Owner.setupProps<TRole>(props)

    const owner = new Owner({ ...ownerProps, role: CollaboratorRole.OWNER }, id)

    return owner
  }
}
