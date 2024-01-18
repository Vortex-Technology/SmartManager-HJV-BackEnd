import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { MarketsRepository } from '../repositories/MarketsRepository'
import {
  Collaborator,
  CollaboratorRole,
} from '@modules/collaborator/entities/Collaborator'
import { MarketNotFound } from '../errors/MarketNorFound'
import { CollaboratorsRepository } from '@modules/collaborator/repositories/CollaboratorsRepository'
import { CollaboratorNotFound } from '@modules/refreshToken/errors/CollaboratorNotFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'

interface Request {
  marketId: string
  collaboratorId: string
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
    private readonly marketsRepository: MarketsRepository,
    private readonly collaboratorsRepository: CollaboratorsRepository,
  ) {}

  async execute({
    marketId,
    collaboratorId,
    page,
    limit,
  }: Request): Promise<Response> {
    const acceptListForRoles = [CollaboratorRole.MANAGER]

    const collaborator =
      await this.collaboratorsRepository.findById(collaboratorId)

    if (!collaborator) {
      return left(new CollaboratorNotFound())
    }

    if (!acceptListForRoles.includes(collaborator.role)) {
      return left(new PermissionDenied())
    }

    const market = await this.marketsRepository.findById(marketId)

    if (!market) {
      return left(new MarketNotFound())
    }

    if (!collaborator.marketId.equals(market.id)) {
      return left(new PermissionDenied())
    }

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
