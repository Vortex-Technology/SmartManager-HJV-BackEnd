import { Either, left, right } from '@shared/core/error/Either'
import { Order } from '../entities/Order'
import { Injectable } from '@nestjs/common'
import { VerifyPermissionsOfCollaboratorInMarketService } from '@modules/interceptors/services/VerifyPermissionsOfCollaboratorInMarket.service'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { MarketNotFound } from '@modules/market/errors/MarketNorFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { OrdersRepository } from '../repositories/OrdersRepository'

interface Request {
  collaboratorId: string
  companyId: string
  marketId: string
}

type Response = Either<
  CollaboratorNotFound | CompanyNotFound | PermissionDenied | MarketNotFound,
  {
    order: Order
  }
>

@Injectable()
export class CreateOrderService {
  constructor(
    private readonly verifyPermissions: VerifyPermissionsOfCollaboratorInMarketService,
    private readonly ordersRepository: OrdersRepository,
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

    const { collaborator, company, market } = response.value

    const order = Order.create({
      companyId: company.id,
      marketId: market.id,
      openedById: collaborator.id,
    })

    await this.ordersRepository.create(order)

    return right({ order })
  }
}
