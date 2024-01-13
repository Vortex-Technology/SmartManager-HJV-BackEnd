import { Owner } from '../entities/Owner'

export class OwnerPresenter {
  static toHTTP(owner: Owner) {
    return {
      id: owner.id.toString(),
      name: owner.name,
      image: {
        url: owner.image,
        alt: owner.name,
      },
      role: owner.role,
    }
  }
}
