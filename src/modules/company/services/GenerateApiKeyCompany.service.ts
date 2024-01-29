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
import { UsersRepository } from '@modules/user/repositories/UsersRepository'
import { UserNotFound } from '@modules/user/errors/UserNotFound'

interface Request {
  userId: string
  companyId: string
}

type Response = Either<
  CompanyNotFound | PermissionDenied | LotsOfExistingKeys | UserNotFound,
  { apiKey: ApiKey }
>

@Injectable()
export class GenerateApiKeyCompanyService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly companiesRepository: CompaniesRepository,
    private readonly apisKeyRepository: ApiKeysRepository,
    private readonly hashGenerator: HashGenerator,
    private readonly handleHashGenerator: HandleHashGenerator,
  ) {}

  async execute({ userId, companyId }: Request): Promise<Response> {
    const user = await this.usersRepository.findById(userId)
    if (!user) {
      return left(new UserNotFound())
    }

    const company = await this.companiesRepository.findByIdAndFounderId(
      companyId,
      userId,
    )
    if (!company) {
      return left(new CompanyNotFound())
    }

    if (!company.founderId.equals(user.id)) {
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
    await this.apisKeyRepository.create(apiKey)

    return right({
      apiKey,
    })
  }
}
