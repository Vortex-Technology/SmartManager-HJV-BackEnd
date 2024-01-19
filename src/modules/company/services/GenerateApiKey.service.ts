import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { CompaniesRepository } from '../repositories/CompaniesRepository'
import { ApiKey } from '../entities/ApiKey'
import { CompanyNotFound } from '../errors/CompanyNotFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { HandleHashGenerator } from '@providers/cryptography/contracts/handleHashGenerator'
import { ApiKeysRepository } from '../repositories/ApiKeysRepository'
import { LotsOfExistingKeys } from '../errors/LotsOfExistingKeys'
import { OwnersRepository } from '@modules/owner/repositories/OwnersRepository'

interface Request {
  requesterId: string
  companyId: string
}

type Response = Either<
  CompanyNotFound | PermissionDenied | LotsOfExistingKeys,
  { apiKey: ApiKey }
>

@Injectable()
export class GenerateApiKeyService {
  constructor(
    private readonly ownersRepository: OwnersRepository,
    private readonly companiesRepository: CompaniesRepository,
    private readonly apisKeyRepository: ApiKeysRepository,
    private readonly hashGenerator: HashGenerator,
    private readonly handleHashGenerator: HandleHashGenerator,
  ) {}

  async execute({ requesterId, companyId }: Request): Promise<Response> {
    const owner = await this.ownersRepository.findById(requesterId)

    if (!owner) {
      return left(new PermissionDenied())
    }

    const company = await this.companiesRepository.findById(companyId)

    if (!company) {
      return left(new CompanyNotFound())
    }

    if (!company.ownerId.equals(owner.id)) {
      return left(new PermissionDenied())
    }

    const apiKeysActiveForThisCompany =
      await this.apisKeyRepository.findActivesByCompanyId(company.id.toString())

    if (apiKeysActiveForThisCompany.length > 0) {
      return left(new LotsOfExistingKeys())
    }

    const secret = await this.handleHashGenerator.handleHash()
    const key = await this.hashGenerator.hash(company.companyName + secret)

    const apiKey = ApiKey.create({
      key,
      secret,
      companyId: company.id,
    })

    return right({
      apiKey,
    })
  }
}
