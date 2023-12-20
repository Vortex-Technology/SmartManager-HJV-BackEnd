import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { AdministratorRepository } from '../repositories/AdministratorRepository'
import { AdministratorWrongCredentials } from '../errors/AdministratorWrongCredentials'
import { HashComparer } from '@providers/cryptography/contracts/hashComparer'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { EnvService } from '@infra/env/env.service'
import { DateAddition } from '@providers/date/contracts/dateAddition'
import { RefreshAdministratorToken } from '../entities/RefreshAdministratorToken'
import { RefreshAdministratorTokenRepository } from '../repositories/RefreshAdministratorTokenRepository'

interface Request {
  login: string
  password: string
}

type Response = Either<
  AdministratorWrongCredentials,
  {
    accessToken: string
    refreshToken: string
  }
>

@Injectable()
export class LoginAdministratorService {
  constructor(
    private readonly administratorRepository: AdministratorRepository,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
    private readonly env: EnvService,
    private readonly dateAddition: DateAddition,
    private readonly refreshAdministratorTokenRepository: RefreshAdministratorTokenRepository,
  ) {}

  async execute({ login, password }: Request): Promise<Response> {
    const administrator = await this.administratorRepository.findByLogin(login)

    if (!administrator) {
      return left(new AdministratorWrongCredentials())
    }

    const passwordMatch = await this.hashComparer.compare(
      password,
      administrator.password,
    )

    if (!passwordMatch) {
      return left(new AdministratorWrongCredentials())
    }

    const accessToken = await this.encrypter.encrypt(
      {
        sub: administrator.id.toString(),
        role: administrator.role,
      },
      {
        expiresIn: this.env.get('JWT_ADM_ACCESS_EXPIRES_IN'),
      },
    )

    const _refreshToken = await this.encrypter.encrypt(
      {
        sub: administrator.id.toString(),
        role: administrator.role,
      },
      {
        expiresIn: this.env.get('JWT_ADM_REFRESH_EXPIRES_IN'),
      },
    )

    const refreshToken = RefreshAdministratorToken.create({
      administratorId: administrator.id,
      token: _refreshToken,
      expiresIn: this.dateAddition.addDaysInCurrentDate(
        this.env.get('ADM_REFRESH_EXPIRES_IN'),
      ),
    })

    await this.refreshAdministratorTokenRepository.create(refreshToken)

    return right({
      accessToken,
      refreshToken: refreshToken.token,
    })
  }
}
