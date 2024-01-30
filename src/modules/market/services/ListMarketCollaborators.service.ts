import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import {
  Collaborator,
  CollaboratorRole,
} from '@modules/collaborator/entities/Collaborator'
import { MarketNotFound } from '../errors/MarketNorFound'
import { CollaboratorsRepository } from '@modules/collaborator/repositories/CollaboratorsRepository'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { VerifyPermissionsOfCollaboratorInMarketService } from '@modules/interceptors/services/VerifyPermissionsOfCollaboratorInMarket.service'

interface Request {
  marketId: string
  collaboratorId: string
  companyId: string
  page: number
  limit: number
}

type Response = Either<
  MarketNotFound | CollaboratorNotFound | PermissionDenied,
  {
    collaborators: Collaborator[]
    size: number
    page: number
  }
>

@Injectable()
export class ListMarketCollaboratorsService {
  constructor(
    private readonly collaboratorsRepository: CollaboratorsRepository,
    private readonly verifyPermissions: VerifyPermissionsOfCollaboratorInMarketService,
  ) {}

  async execute({
    marketId,
    collaboratorId,
    companyId,
    page,
    limit,
  }: Request): Promise<Response> {
    const response = await this.verifyPermissions.execute({
      acceptedRoles: [CollaboratorRole.MANAGER, CollaboratorRole.OWNER],
      collaboratorId,
      companyId,
      marketId,
    })

    if (response.isLeft()) return left(response.value)

    const collaborators = await this.collaboratorsRepository.findManyByMarketId(
      {
        marketId,
        page,
        limit,
      },
    )

    const countOfCollaborators =
      await this.collaboratorsRepository.countByMarketId(marketId)

    return right({
      collaborators,
      page,
      size: countOfCollaborators,
    })
  }
}
