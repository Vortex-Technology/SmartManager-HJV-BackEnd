import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { CollaboratorsRepository } from '../repositories/CollaboratorsRepository'
import { HashComparer } from '@providers/cryptography/contracts/hashComparer'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { DateAddition } from '@providers/date/contracts/dateAddition'
import { CollaboratorWrongCredentials } from '../errors/CollaboratorWrongCredentials'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { MarketNotFound } from '@modules/market/errors/MarketNorFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { CompanyInactive } from '@modules/company/errors/CompanyInactive'
import { EnvService } from '@infra/env/Env.service'
import { ApiKeysRepository } from '@modules/company/repositories/ApiKeysRepository'
import { ApiKeyIsRevoked } from '@modules/company/errors/ApiKeyIsRevoked'
import { VerifyPermissionsOfCollaboratorInMarketService } from '@modules/interceptors/services/VerifyPermissionsOfCollaboratorInMarket.service'
import { CollaboratorRole } from '../entities/Collaborator'
import { RefreshTokensCollaboratorsRepository } from '@modules/refreshToken/repositories/RefreshTokensCollaboratorsRepository'
import { RefreshTokenCollaborator } from '@modules/refreshToken/entities/RefreshTokenCollaborator'

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
    private readonly collaboratorsRepository: CollaboratorsRepository,
    private readonly refreshTokensCollaboratorsRepository: RefreshTokensCollaboratorsRepository,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
    private readonly env: EnvService,
    private readonly dateAddition: DateAddition,
    private readonly verifyPermissions: VerifyPermissionsOfCollaboratorInMarketService,
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

    const collaborator = await this.collaboratorsRepository.findByEmail(email)
    if (!collaborator) {
      return left(new CollaboratorWrongCredentials())
    }

    const response = await this.verifyPermissions.execute({
      acceptedRoles: [
        CollaboratorRole.MANAGER,
        CollaboratorRole.OWNER,
        CollaboratorRole.SELLER,
        CollaboratorRole.STOCKIST,
      ],
      collaborator,
      companyId,
      marketId,
    })

    if (response.isLeft()) return left(response.value)

    const { company, market } = response.value

    if (!apiKey.companyId.equals(company.id)) {
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
        companyId: company.id.toString(),
        marketId: market.id.toString(),
      },
      {
        algorithm: 'HS256',
        secret: apiKey.secret,
        expiresIn: this.env.get('JWT_USER_ACCESS_EXPIRES_IN'),
      },
    )

    const _refreshToken = await this.encrypter.encrypt(
      {
        sub: collaborator.id.toString(),
        role: collaborator.role,
        companyId: company.id.toString(),
        marketId: market.id.toString(),
      },
      {
        algorithm: 'HS256',
        secret: apiKey.secret,
        expiresIn: this.env.get('JWT_USER_REFRESH_EXPIRES_IN'),
      },
    )

    const refreshToken = RefreshTokenCollaborator.create({
      collaboratorId: collaborator.id,
      apiKeyId: apiKey.id,
      companyId: company.id,
      marketId: market.id,
      token: _refreshToken,
      expiresIn: this.dateAddition.addDaysInCurrentDate(
        this.env.get('USER_REFRESH_EXPIRES_IN'),
      ),
    })

    await this.refreshTokensCollaboratorsRepository.create(refreshToken)

    return right({
      accessToken,
      refreshToken: refreshToken.token,
    })
  }
}
