import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { UsersRepository } from '../repositories/UsersRepository'
import { User } from '../entities/User'
import { UserAlreadyExistsWithSameEmail } from '../errors/UserAlreadyExistsWithSameEmail'
import { UserNotFound } from '../errors/UserNotFound'

interface Request {
  id: string
  name: string
  image?: string | null
  email: string
}

type Response = Either<
  UserNotFound | UserAlreadyExistsWithSameEmail,
  {
    user: User
  }
>

@Injectable()
export class UpdateUserService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({ id, email, name, image }: Request): Promise<Response> {
    const user = await this.usersRepository.findById(id)

    if (!user) {
      return left(new UserNotFound())
    }

    const userExists = await this.usersRepository.findByEmail(email)

    if (userExists && !user.equals(userExists)) {
      return left(new UserAlreadyExistsWithSameEmail())
    }

    user.email = email
    user.name = name
    user.image = image === undefined ? user.image : image

    await this.usersRepository.save(user)

    return right({
      user,
    })
  }
}
