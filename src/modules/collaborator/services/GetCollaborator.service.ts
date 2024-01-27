import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { Collaborator, CollaboratorRole } from '../entities/Collaborator'
import { CollaboratorNotFound } from '../errors/CollaboratorNotFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { VerifyPermissionsOfCollaboratorInMarketService } from '@modules/interceptors/services/VerifyPermissionsOfCollaboratorInMarket.service'
import { MarketNotFound } from '@modules/market/errors/MarketNorFound'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'

interface Request {
  collaboratorId: string
  companyId: string
  marketId: string
}

type Response = Either<
  CollaboratorNotFound | PermissionDenied | MarketNotFound | CompanyNotFound,
  { collaborator: Collaborator }
>

@Injectable()
export class GetCollaboratorService {
  constructor(
    private readonly verifyPermissions: VerifyPermissionsOfCollaboratorInMarketService,
  ) {}

  async execute({
    collaboratorId,
    companyId,
    marketId,
  }: Request): Promise<Response> {
    const response = await this.verifyPermissions.execute({
      acceptedRoles: [
        CollaboratorRole.MANAGER,
        CollaboratorRole.OWNER,
        CollaboratorRole.SELLER,
        CollaboratorRole.STOCKIST,
      ],
      collaboratorId,
      companyId,
      marketId,
    })

    if (response.isLeft()) return left(response.value)

    const { collaborator } = response.value

    return right({ collaborator })
  }
}
