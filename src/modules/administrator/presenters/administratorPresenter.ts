import { Administrator } from '../entities/Administrator'

export class AdministratorPresenter {
  static toHTTP(administrator: Administrator) {
    return {
      id: administrator.id.toString(),
      name: administrator.name,
      image: {
        url: administrator.image,
        alt: administrator.name,
      },
      role: administrator.role,
    }
  }
}
