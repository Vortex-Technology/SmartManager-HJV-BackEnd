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
    const owner = Collaborator.create<TRole>(
      {
        ...props,
        role: CollaboratorRole.OWNER as TRole,
      },
      id,
    )

    return owner
  }
}
