import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { OwnersRepository } from '../repositories/OwnersRepository'
import { HashComparer } from '@providers/cryptography/contracts/hashComparer'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { EnvService } from '@infra/env/env.service'
import { DateAddition } from '@providers/date/contracts/dateAddition'
import { RefreshTokenRepository } from '@modules/refreshToken/repositories/RefreshTokenRepository'
import { RefreshToken } from '@modules/refreshToken/entities/RefreshToken'
import { OwnerWrongCredentials } from '../errors/OwnerWrongCredentials'

interface Request {
  login: string
  password: string
}

type Response = Either<
  OwnerWrongCredentials,
  {
    accessToken: string
    refreshToken: string
  }
>

@Injectable()
export class LoginOwnerService {
  constructor(
    private readonly ownersRepository: OwnersRepository,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
    private readonly env: EnvService,
    private readonly dateAddition: DateAddition,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute({ login, password }: Request): Promise<Response> {
    const owner = await this.ownersRepository.findByLogin(login)

    if (!owner) {
      return left(new OwnerWrongCredentials())
    }

    const passwordMatch = await this.hashComparer.compare(
      password,
      owner.password,
    )

    if (!passwordMatch) {
      return left(new OwnerWrongCredentials())
    }

    const accessToken = await this.encrypter.encrypt(
      {
        sub: owner.id.toString(),
        role: owner.role,
      },
      {
        expiresIn: this.env.get('JWT_ADM_ACCESS_EXPIRES_IN'),
      },
    )

    const _refreshToken = await this.encrypter.encrypt(
      {
        sub: owner.id.toString(),
        role: owner.role,
      },
      {
        expiresIn: this.env.get('JWT_ADM_REFRESH_EXPIRES_IN'),
      },
    )

    const refreshToken = RefreshToken.create({
      collaboratorId: owner.id,
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
