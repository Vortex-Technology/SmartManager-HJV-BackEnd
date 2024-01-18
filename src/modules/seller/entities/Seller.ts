import {
  Collaborator,
  CollaboratorCreatePropsOptional,
  CollaboratorRole,
} from '@modules/collaborator/entities/Collaborator'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export class Seller extends Collaborator<CollaboratorRole.SELLER> {
  static create<TRole extends CollaboratorRole = CollaboratorRole.SELLER>(
    props: CollaboratorCreatePropsOptional<TRole>,
    id?: UniqueEntityId,
  ) {
    const sellerProps = Seller.setupProps<TRole>(props)

    const seller = new Seller(
      { ...sellerProps, role: CollaboratorRole.SELLER },
      id,
    )

    return seller
  }
}
