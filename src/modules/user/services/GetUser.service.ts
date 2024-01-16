import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { UserNotFount } from '../errors/UserNotFound'
import { User } from '../entities/User'
import { UsersRepository } from '../repositories/UsersRepository'

interface Request {
  userId: string
}

type Response = Either<
  UserNotFount,
  {
    user: User
  }
>

@Injectable()
export class GetUserService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({ userId }: Request): Promise<Response> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new UserNotFount())
    }

    return right({
      user,
    })
  }
}
