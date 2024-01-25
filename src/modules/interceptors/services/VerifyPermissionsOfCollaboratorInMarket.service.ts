import {
  Collaborator,
  CollaboratorRole,
} from '@modules/collaborator/entities/Collaborator'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { Either, left, right } from '@shared/core/error/Either'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { Injectable } from '@nestjs/common'
import { Company } from '@modules/company/entities/Company'
import { MarketNotFound } from '@modules/market/errors/MarketNorFound'
import { Market } from '@modules/market/entities/Market'
import { VerifyPermissionsOfCollaboratorInCompanyService } from './VerifyPermissionsOfCollaboratorInCompany.service'
import { MarketsRepository } from '@modules/market/repositories/MarketsRepository'

interface Request {
  acceptedRoles: CollaboratorRole[]
  companyId: string
  collaboratorId: string
  marketId: string
}

type Response = Either<
  CollaboratorNotFound | CompanyNotFound | PermissionDenied | MarketNotFound,
  { company: Company; collaborator: Collaborator; market: Market }
>

@Injectable()
export class VerifyPermissionsOfCollaboratorInMarketService {
  constructor(
    private readonly verifyPermissionsOfCollaboratorInCompanyService: VerifyPermissionsOfCollaboratorInCompanyService,
    private readonly marketsRepository: MarketsRepository,
  ) {}

  async execute({
    acceptedRoles,
    collaboratorId,
    companyId,
    marketId,
  }: Request): Promise<Response> {
    const response =
      await this.verifyPermissionsOfCollaboratorInCompanyService.execute({
        acceptedRoles,
        collaboratorId,
        companyId,
      })

    if (response.isLeft()) {
      return left(response.value)
    }

    const { company, collaborator } = response.value

    const market = await this.marketsRepository.findById(marketId)
    if (!market) {
      return left(new MarketNotFound())
    }

    if (collaborator.marketId && !collaborator.marketId.equals(market.id)) {
      return left(new PermissionDenied())
    }

    if (!market.companyId.equals(company.id)) {
      return left(new PermissionDenied())
    }

    if (
      !collaborator.companyId?.equals(company.id) &&
      !collaborator.marketId?.equals(market.id)
    ) {
      return left(new PermissionDenied())
    }

    return right({ company, collaborator, market })
  }
}
