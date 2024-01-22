import {
  Collaborator,
  CollaboratorCreateOwnerPropsOptional,
  CollaboratorRole,
} from '@modules/collaborator/entities/Collaborator'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

export class Owner extends Collaborator<CollaboratorRole.OWNER> {
  static create<TRole extends CollaboratorRole = CollaboratorRole.OWNER>(
    props: CollaboratorCreateOwnerPropsOptional<TRole>,
    id?: UniqueEntityId,
  ) {
    const ownerProps = Owner.setupProps<TRole>(props)

    const owner = new Owner(
      { ...ownerProps, role: CollaboratorRole.OWNER, marketId: null },
      id,
    )

    return owner
  }
}
