import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { CollaboratorsRepository } from '../repositories/CollaboratorsRepository'
import { HashComparer } from '@providers/cryptography/contracts/hashComparer'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { DateAddition } from '@providers/date/contracts/dateAddition'
import { RefreshTokensRepository } from '@modules/refreshToken/repositories/RefreshTokensRepository'
import { RefreshToken } from '@modules/refreshToken/entities/RefreshToken'
import { CollaboratorWrongCredentials } from '../errors/CollaboratorWrongCredentials'
import { CompaniesRepository } from '@modules/company/repositories/CompaniesRepository'
import { MarketsRepository } from '@modules/market/repositories/MarketsRepository'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { MarketNotFound } from '@modules/market/errors/MarketNorFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { CompanyInactive } from '@modules/company/errors/CompanyInactive'
import { CompanyStatus } from '@modules/company/entities/Company'
import { EnvService } from '@infra/env/Env.service'
import { ApiKeysRepository } from '@modules/company/repositories/ApiKeysRepository'
import { ApiKeyIsRevoked } from '@modules/company/errors/ApiKeyIsRevoked'

interface Request {
  email: string
  password: string
  companyId: string
  marketId: string
  apiKey: string
}

type Response = Either<
  | CollaboratorWrongCredentials
  | CompanyNotFound
  | MarketNotFound
  | PermissionDenied
  | CompanyInactive
  | ApiKeyIsRevoked,
  {
    accessToken: string
    refreshToken: string
  }
>

@Injectable()
export class LoginCollaboratorService {
  constructor(
    private readonly apiKeysRepository: ApiKeysRepository,
    private readonly companiesRepository: CompaniesRepository,
    private readonly marketsRepository: MarketsRepository,
    private readonly collaboratorsRepository: CollaboratorsRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
    private readonly env: EnvService,
    private readonly dateAddition: DateAddition,
  ) {}

  async execute({
    email,
    password,
    companyId,
    marketId,
    apiKey: key,
  }: Request): Promise<Response> {
    const apiKey = await this.apiKeysRepository.findByKey(key)

    if (!apiKey) {
      return left(new PermissionDenied())
    }

    if (apiKey.revokedAt) {
      return left(new ApiKeyIsRevoked())
    }

    const company = await this.companiesRepository.findById(companyId)

    if (!company) {
      return left(new CompanyNotFound())
    }

    const market = await this.marketsRepository.findById(marketId)

    if (!market) {
      return left(new MarketNotFound())
    }

    if (!market.companyId.equals(company.id)) {
      return left(new PermissionDenied())
    }

    if (company.status === CompanyStatus.INACTIVE) {
      return left(new CompanyInactive())
    }

    const collaborator = await this.collaboratorsRepository.findByEmail(email)

    if (!collaborator) {
      return left(new CollaboratorWrongCredentials())
    }

    if (!collaborator.marketId.equals(market.id)) {
      return left(new PermissionDenied())
    }

    const passwordMatch = await this.hashComparer.compare(
      password,
      collaborator.password,
    )

    if (!passwordMatch) {
      return left(new CollaboratorWrongCredentials())
    }

    const accessToken = await this.encrypter.encrypt(
      {
        sub: collaborator.id.toString(),
        role: collaborator.role,
      },
      {
        secret: apiKey.secret,
        expiresIn: this.env.get('JWT_USER_ACCESS_EXPIRES_IN'),
      },
    )

    const _refreshToken = await this.encrypter.encrypt(
      {
        sub: collaborator.id.toString(),
        role: collaborator.role,
      },
      {
        secret: apiKey.secret,
        expiresIn: this.env.get('JWT_USER_REFRESH_EXPIRES_IN'),
      },
    )

    const refreshToken = RefreshToken.create({
      collaboratorId: collaborator.id,
      token: _refreshToken,
      expiresIn: this.dateAddition.addDaysInCurrentDate(
        this.env.get('USER_REFRESH_EXPIRES_IN'),
      ),
    })

    await this.refreshTokensRepository.create(refreshToken)

    return right({
      accessToken,
      refreshToken: refreshToken.token,
    })
  }
}
