import { Either, left, right } from '@shared/core/error/Either'
import { SessionExpired } from '../errors/SessionExpired'
import { Injectable } from '@nestjs/common'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { Decoder } from '@providers/cryptography/contracts/decoder'
import { DateVerifications } from '@providers/date/contracts/dateVerifications'
import { RefreshToken } from '../entities/RefreshToken'
import { DateAddition } from '@providers/date/contracts/dateAddition'
import { RefreshTokensRepository } from '../repositories/RefreshTokensRepository'
import { EnvService } from '@infra/env/Env.service'
import { UsersRepository } from '@modules/user/repositories/UsersRepository'
import { UserNotFound } from '@modules/user/errors/UserNotFound'

interface Request {
  refreshToken: string
}

type Response = Either<
  SessionExpired | UserNotFound,
  {
    accessToken: string
    refreshToken: string
  }
>

@Injectable()
export class RefreshTokenUserService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokenRepository: RefreshTokensRepository,
    private readonly dateVerifications: DateVerifications,
    private readonly dateAddition: DateAddition,
    private readonly encrypter: Encrypter,
    private readonly decoder: Decoder,
    private readonly env: EnvService,
  ) {}

  async execute({ refreshToken }: Request): Promise<Response> {
    const { isValid, payload } = await this.decoder.decrypt(refreshToken)

    if (!isValid) {
      return left(new SessionExpired())
    }

    if (!payload) {
      return left(new SessionExpired())
    }

    const { sub } = payload

    const user = await this.usersRepository.findById(sub)
    if (!user) {
      return left(new UserNotFound())
    }

    const collaboratorToken =
      await this.refreshTokenRepository.findByUserIdAndRefreshToken({
        userId: user.id.toString(),
        refreshToken,
      })

    if (!collaboratorToken) {
      return left(new SessionExpired())
    }

    const tokenIsNotExpired = this.dateVerifications.isBefore({
      endDate: collaboratorToken.expiresIn,
    })

    await this.refreshTokenRepository.permanentlyDeleteByUserId(
      user.id.toString(),
    )

    if (!tokenIsNotExpired) {
      return left(new SessionExpired())
    }

    const jwtRefreshExpires = this.env.get('JWT_USER_REFRESH_EXPIRES_IN')
    const refreshExpires = this.env.get('USER_REFRESH_EXPIRES_IN')
    const jwtAccessExpires = this.env.get('JWT_USER_ACCESS_EXPIRES_IN')

    const revalidatedRefreshToken = await this.encrypter.encrypt(
      {
        sub: user.id.toString(),
      },
      {
        expiresIn: jwtRefreshExpires,
      },
    )

    const accessToken = await this.encrypter.encrypt(
      {
        sub: user.id.toString(),
      },
      {
        expiresIn: jwtAccessExpires,
      },
    )

    const newRefreshToken = RefreshToken.create({
      userId: user.id,
      token: revalidatedRefreshToken,
      expiresIn: this.dateAddition.addDaysInCurrentDate(refreshExpires),
    })

    await this.refreshTokenRepository.create(newRefreshToken)

    return right({
      accessToken,
      refreshToken: revalidatedRefreshToken,
    })
  }
}
