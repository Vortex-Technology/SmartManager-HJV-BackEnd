import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { SellerRepository } from '../repositories/SellerRepository'
import { SellerWrongCredentials } from '../errors/SellerWrongCredentials'
import { HashComparer } from '@providers/cryptography/contracts/hashComparer'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { EnvService } from '@infra/env/env.service'
import { DateAddition } from '@providers/date/contracts/dateAddition'
import { RefreshSellerToken } from '../entities/RefreshSellerToken'
import { RefreshSellerTokenRepository } from '../repositories/RefreshSellerTokenRepository'

interface Request {
  login: string
  password: string
}

type Response = Either<
  SellerWrongCredentials,
  {
    accessToken: string
    refreshToken: string
  }
>

@Injectable()
export class LoginSellerService {
  constructor(
    private readonly sellerRepository: SellerRepository,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
    private readonly env: EnvService,
    private readonly dateAddition: DateAddition,
    private readonly refreshSellerTokenRepository: RefreshSellerTokenRepository,
  ) {}

  async execute({ login, password }: Request): Promise<Response> {
    const seller = await this.sellerRepository.findByLogin(login)

    if (!seller) {
      return left(new SellerWrongCredentials())
    }

    const passwordMatch = await this.hashComparer.compare(
      password,
      seller.password,
    )

    if (!passwordMatch) {
      return left(new SellerWrongCredentials())
    }

    const accessToken = await this.encrypter.encrypt(
      {
        sub: seller.id.toString(),
        type: 'SELLER',
      },
      {
        expiresIn: this.env.get('JWT_USER_ACCESS_EXPIRES_IN'),
      },
    )

    const _refreshToken = await this.encrypter.encrypt(
      {
        sub: seller.id.toString(),
        type: 'SELLER',
      },
      {
        expiresIn: this.env.get('JWT_USER_REFRESH_EXPIRES_IN'),
      },
    )

    const refreshToken = RefreshSellerToken.create({
      sellerId: seller.id,
      token: _refreshToken,
      expiresIn: this.dateAddition.addDaysInCurrentDate(
        this.env.get('USER_REFRESH_EXPIRES_IN'),
      ),
    })

    await this.refreshSellerTokenRepository.create(refreshToken)

    return right({
      accessToken,
      refreshToken: refreshToken.token,
    })
  }
}
