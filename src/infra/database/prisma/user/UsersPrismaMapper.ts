import { User } from '@modules/user/entities/User'
import { Prisma, User as UserPrisma } from '@prisma/client'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export class UsersPrismaMapper {
  static toEntity(raw: UserPrisma): User {
    return User.create(
      {
        email: raw.email,
        name: raw.name,
        password: raw.password,
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
        updatedAt: raw.updatedAt,
        emailVerifiedAt: raw.emailVerifiedAt,
        image: raw.image,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(user: User): Prisma.UserUncheckedCreateInput {
    return {
      email: user.email,
      name: user.name,
      password: user.password,
      id: user.id.toString(),
      createdAt: user.createdAt,
      deletedAt: user.deletedAt,
      emailVerifiedAt: user.emailVerifiedAt,
      image: user.image,
      updatedAt: user.updatedAt,
    }
  }
}
