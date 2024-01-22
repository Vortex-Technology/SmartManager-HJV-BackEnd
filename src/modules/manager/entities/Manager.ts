import {
  Collaborator,
  CollaboratorCreatePropsOptional,
  CollaboratorRole,
} from '@modules/collaborator/entities/Collaborator'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

export class Manager extends Collaborator<CollaboratorRole.MANAGER> {
  static create<TRole extends CollaboratorRole = CollaboratorRole.MANAGER>(
    props: CollaboratorCreatePropsOptional<TRole>,
    id?: UniqueEntityId,
  ) {
    const managerProps = Manager.setupProps<TRole>(props)

    const manager = new Manager(
      { ...managerProps, role: CollaboratorRole.MANAGER, companyId: null },
      id,
    )

    return manager
  }
}
