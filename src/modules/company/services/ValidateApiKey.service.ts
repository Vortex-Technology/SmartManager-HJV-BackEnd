import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { CompaniesRepository } from '../repositories/CompaniesRepository'
import { CompanyNotFound } from '../errors/CompanyNotFound'
import { ApiKeysRepository } from '../repositories/ApiKeysRepository'
import { ApiKeyIsRevoked } from '../errors/ApiKeyIsRevoked'
import { HashComparer } from '@providers/cryptography/contracts/hashComparer'

interface Request {
  key: string
}

type Response = Either<ApiKeyIsRevoked | CompanyNotFound, { valid: boolean }>

@Injectable()
export class ValidateApiKeyService {
  constructor(
    private readonly companiesRepository: CompaniesRepository,
    private readonly apisKeyRepository: ApiKeysRepository,
    private readonly hashComparer: HashComparer,
  ) {}

  async execute({ key }: Request): Promise<Response> {
    const apiKey = await this.apisKeyRepository.findByKey(key)

    if (!apiKey) {
      return right({
        valid: false,
      })
    }

    if (apiKey.revokedAt) {
      return left(new ApiKeyIsRevoked())
    }

    const company = await this.companiesRepository.findById(
      apiKey.companyId.toString(),
    )

    if (!company) {
      return left(new CompanyNotFound())
    }

    const valid = await this.hashComparer.compare(
      company.companyName + apiKey.secret,
      key,
    )

    return right({ valid })
  }
}
