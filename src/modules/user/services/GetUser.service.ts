import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { UserNotFound } from '../errors/UserNotFound'
import { User } from '../entities/User'
import { UsersRepository } from '../repositories/UsersRepository'

interface Request {
  userId: string
}

type Response = Either<
  UserNotFound,
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
      return left(new UserNotFound())
    }

    return right({
      user,
    })
  }
}
