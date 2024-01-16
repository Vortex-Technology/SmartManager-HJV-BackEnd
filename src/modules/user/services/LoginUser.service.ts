import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { HashComparer } from '@providers/cryptography/contracts/hashComparer'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { EnvService } from '@infra/env/env.service'
import { DateAddition } from '@providers/date/contracts/dateAddition'
import { RefreshTokenRepository } from '@modules/refreshToken/repositories/RefreshTokenRepository'
import { RefreshToken } from '@modules/refreshToken/entities/RefreshToken'
import { UserWrongCredentials } from '../errors/UserWrongCredentials'
import { UsersRepository } from '../repositories/UsersRepository'

interface Request {
  email: string
  password: string
}

type Response = Either<
  UserWrongCredentials,
  {
    accessToken: string
    refreshToken: string
  }
>

@Injectable()
export class LoginUserService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
    private readonly env: EnvService,
    private readonly dateAddition: DateAddition,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute({ email, password }: Request): Promise<Response> {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      return left(new UserWrongCredentials())
    }

    const passwordMatch = await this.hashComparer.compare(
      password,
      user.password,
    )

    if (!passwordMatch) {
      return left(new UserWrongCredentials())
    }

    const accessToken = await this.encrypter.encrypt(
      {
        sub: user.id.toString(),
        type: 'USER',
      },
      {
        expiresIn: this.env.get('JWT_ADM_ACCESS_EXPIRES_IN'),
      },
    )

    const _refreshToken = await this.encrypter.encrypt(
      {
        sub: user.id.toString(),
        type: 'USER',
      },
      {
        expiresIn: this.env.get('JWT_ADM_REFRESH_EXPIRES_IN'),
      },
    )

    const refreshToken = RefreshToken.create({
      collaboratorId: user.id,
      token: _refreshToken,
      expiresIn: this.dateAddition.addDaysInCurrentDate(
        this.env.get('ADM_REFRESH_EXPIRES_IN'),
      ),
    })

    await this.refreshTokenRepository.create(refreshToken)

    return right({
      accessToken,
      refreshToken: refreshToken.token,
    })
  }
}
