import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { UsersRepository } from '../repositories/UsersRepository'
import { User } from '../entities/User'
import { UserAlreadyExistsWithSameEmail } from '../errors/UserAlreadyExistsWithSameEmail'

interface Request {
  name: string
  image?: string
  email: string
  password: string
}

type Response = Either<
  UserAlreadyExistsWithSameEmail,
  {
    user: User
  }
>

@Injectable()
export class CreateUserService {
  constructor(
    private readonly hasherGenerator: HashGenerator,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute({ email, name, password, image }: Request): Promise<Response> {
    const userExists = await this.usersRepository.findByEmail(email)

    if (userExists) {
      return left(new UserAlreadyExistsWithSameEmail())
    }

    const encryptedPassword = await this.hasherGenerator.hash(password)

    const user = User.create({
      email,
      name,
      image,
      password: encryptedPassword,
    })

    await this.usersRepository.create(user)

    return right({
      user,
    })
  }
}
