import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { AttendantRepository } from '../repositories/AttendantRepository'
import { AttendantWrongCredentials } from '../errors/AttendantWrongCredentials'
import { HashComparer } from '@providers/cryptography/contracts/hashComparer'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { EnvService } from '@infra/env/env.service'
import { DateAddition } from '@providers/date/contracts/dateAddition'
import { RefreshAttendantToken } from '../entities/RefreshAttendantToken'
import { RefreshAttendantTokenRepository } from '../repositories/RefreshAttendantTokenRepository'

interface Request {
  login: string
  password: string
}

type Response = Either<
  AttendantWrongCredentials,
  {
    accessToken: string
    refreshToken: string
  }
>

@Injectable()
export class LoginAttendantService {
  constructor(
    private readonly attendantRepository: AttendantRepository,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
    private readonly env: EnvService,
    private readonly dateAddition: DateAddition,
    private readonly refreshAttendantTokenRepository: RefreshAttendantTokenRepository,
  ) {}

  async execute({ login, password }: Request): Promise<Response> {
    const attendant = await this.attendantRepository.findByLogin(login)

    if (!attendant) {
      return left(new AttendantWrongCredentials())
    }

    const passwordMatch = await this.hashComparer.compare(
      password,
      attendant.password,
    )

    if (!passwordMatch) {
      return left(new AttendantWrongCredentials())
    }

    const accessToken = await this.encrypter.encrypt(
      {
        sub: attendant.id.toString(),
        type: 'ATTENDANT',
      },
      {
        expiresIn: this.env.get('JWT_USER_ACCESS_EXPIRES_IN'),
      },
    )

    const _refreshToken = await this.encrypter.encrypt(
      {
        sub: attendant.id.toString(),
        type: 'ATTENDANT',
      },
      {
        expiresIn: this.env.get('JWT_USER_REFRESH_EXPIRES_IN'),
      },
    )

    const refreshToken = RefreshAttendantToken.create({
      attendantId: attendant.id,
      token: _refreshToken,
      expiresIn: this.dateAddition.addDaysInCurrentDate(
        this.env.get('USER_REFRESH_EXPIRES_IN'),
      ),
    })

    await this.refreshAttendantTokenRepository.create(refreshToken)

    return right({
      accessToken,
      refreshToken: refreshToken.token,
    })
  }
}
