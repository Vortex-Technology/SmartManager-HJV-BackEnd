import { User } from '../entities/User'

export class UserPresenter {
  static toHTTP(user: User) {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt,
      image: {
        url: user.image,
        alt: user.name,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
