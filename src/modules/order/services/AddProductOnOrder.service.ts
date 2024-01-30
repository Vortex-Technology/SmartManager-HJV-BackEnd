import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { VerifyPermissionsOfCollaboratorInMarketService } from '@modules/interceptors/services/VerifyPermissionsOfCollaboratorInMarket.service'
import { MarketNotFound } from '@modules/market/errors/MarketNorFound'
import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { OrdersRepository } from '../repositories/OrdersRepository'
import { OrderNotFound } from '../errors/OrderNotFound'
import { ProductVariantsRepository } from '@modules/product/repositories/ProductVariantsRepository'
import { ProductVariantNotFound } from '@modules/product/errors/ProductVariantNotFound'
import { ProductVariantInventoriesRepository } from '@modules/inventory/repositories/ProductVariantInventoriesRepository'
import { ProductVariantInventoryNotFound } from '@modules/inventory/errors/ProductVariantInventoryNotFound'
import { NotEnoughItems } from '@modules/inventory/errors/NotEnoughItems'
import { OrderProductVariant } from '../entities/OrderProductVariant'
import { TransactorService } from '@infra/database/transactor/contracts/TransactorService'

interface Request {
  collaboratorId: string
  companyId: string
  marketId: string
  orderId: string
  barcode: string
  quantity: number
}

type Response = Either<
  | CollaboratorNotFound
  | CompanyNotFound
  | PermissionDenied
  | MarketNotFound
  | OrderNotFound
  | ProductVariantNotFound
  | ProductVariantInventoryNotFound
  | NotEnoughItems,
  {
    orderProductVariant: OrderProductVariant
  }
>

@Injectable()
export class AddProductOnOrderService {
  constructor(
    private readonly verifyPermissions: VerifyPermissionsOfCollaboratorInMarketService,
    private readonly ordersRepository: OrdersRepository,
    private readonly productVariantsRepository: ProductVariantsRepository,
    private readonly productVariantInventoriesRepository: ProductVariantInventoriesRepository,
    private readonly transactorService: TransactorService,
  ) {}

  async execute({
    collaboratorId,
    companyId,
    marketId,
    orderId,
    barcode,
    quantity,
  }: Request): Promise<Response> {
    const response = await this.verifyPermissions.execute({
      acceptedRoles: [
        CollaboratorRole.MANAGER,
        CollaboratorRole.OWNER,
        CollaboratorRole.SELLER,
        CollaboratorRole.STOCKIST,
      ],
      companyId,
      marketId,
      collaboratorId,
    })

    if (response.isLeft()) return left(response.value)

    const { market, company } = response.value

    const order = await this.ordersRepository.findByIdWithProducts(orderId)
    if (!order) {
      return left(new OrderNotFound())
    }

    if (
      !order.companyId.equals(company.id) ||
      !order.marketId.equals(market.id)
    ) {
      return left(new PermissionDenied())
    }

    const productVariant =
      await this.productVariantsRepository.findByBarCode(barcode)
    if (!productVariant) {
      return left(new ProductVariantNotFound())
    }

    const productVariantInventory =
      await this.productVariantInventoriesRepository.findByInventoryIdAndProductVariantId(
        market.inventoryId.toString(),
        productVariant.id.toString(),
      )
    if (!productVariantInventory) {
      return left(new ProductVariantInventoryNotFound())
    }

    if (productVariantInventory.quantity > quantity) {
      return left(new NotEnoughItems())
    }

    const orderProductVariant = OrderProductVariant.create({
      orderId: order.id,
      productVariantId: productVariant.id,
      quantity,
    })

    order.addOrderProductVariant(orderProductVariant)
    productVariantInventory.decreaseQuantity(quantity)

    const transaction = this.transactorService.start()

    transaction.add((ex) => this.ordersRepository.save(order, ex))
    transaction.add((ex) =>
      this.productVariantInventoriesRepository.save(
        productVariantInventory,
        ex,
      ),
    )

    await this.transactorService.execute(transaction)

    return right({
      orderProductVariant,
    })
  }
}
