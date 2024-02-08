import { VerifyPermissionsOfCollaboratorInMarketService } from '@modules/interceptors/services/VerifyPermissionsOfCollaboratorInMarket.service'
import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { OrdersRepository } from '../repositories/OrdersRepository'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { MarketNotFound } from '@modules/market/errors/MarketNorFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { OrderNotFound } from '../errors/OrderNotFound'
import { ProductVariantsRepository } from '@modules/product/repositories/ProductVariantsRepository'
import { ProductVariantNotFound } from '@modules/product/errors/ProductVariantNotFound'
import { OrderProductVariantNotFound } from '../errors/OrderProductVariantNotFound'
import { DocGenerator } from '@providers/docs/contracts/DocGenerator'
import { DocPersistence } from '@providers/docs/contracts/DocPersistence'
import { DocType } from '@providers/docs/entities/Doc'

interface Request {
  collaboratorId: string
  companyId: string
  marketId: string
  orderId: string
}

type Response = Either<
  | CollaboratorNotFound
  | CompanyNotFound
  | PermissionDenied
  | MarketNotFound
  | OrderNotFound
  | ProductVariantNotFound,
  null
>

const translation = {
  CASH: 'Dinheiro',
  CREDIT_CARD: 'Cartão de credito',
  DEBIT_CARD: 'Cartão de debito',
  'NOT-PAYED': 'NÃO PAGO',
}

@Injectable()
export class CloseOrderService {
  constructor(
    private readonly verifyPermissions: VerifyPermissionsOfCollaboratorInMarketService,
    private readonly ordersRepository: OrdersRepository,
    private readonly productsVariantsRepository: ProductVariantsRepository,
    private readonly docGenerator: DocGenerator,
    private readonly docPersistence: DocPersistence,
  ) { }

  async execute({
    collaboratorId,
    companyId,
    marketId,
    orderId,
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

    const { market } = response.value

    const order = await this.ordersRepository.findByIdWithProducts(orderId)
    if (!order) {
      return left(new OrderNotFound())
    }

    const productsVariantsId: string[] = []

    order.orderProductsVariants?.getItems().forEach((orderProductVariant) => {
      productsVariantsId.push(orderProductVariant.productVariantId.toString())
    })

    const productsVariants =
      await this.productsVariantsRepository.findByIds(productsVariantsId)

    const doc = this.docGenerator.generate(
      order.protocol.toString(),
      DocType.PDF,
    )

    let total = 0

    const topLine = doc.addLine()
    topLine.addColumn({
      fontSize: 28,
      text: market.tradeName,
    })

    const defLine = doc.addLine({
      yPosition: 20,
    })
    defLine.addColumn({
      text: 'PRODUTO',
    })

    defLine.addColumn({
      xPosition: 120,
      text: 'QNTD',
    })

    defLine.addColumn({
      text: 'VLR UNT',
    })

    defLine.addColumn({
      text: 'VLR TOTAL',
    })

    productsVariants.forEach((productVariant) => {
      if (!productVariant) {
        return left(new ProductVariantNotFound())
      }

      const orderProductsVariant = order.orderProductsVariants
        ?.getItems()
        .find((orderProductVariant) =>
          orderProductVariant.productVariantId.equals(productVariant.id),
        )

      if (!orderProductsVariant) {
        return left(new OrderProductVariantNotFound())
      }

      const infoLine = doc.addLine()
      infoLine.addColumn({
        text: productVariant.name,
      })

      infoLine.addColumn({
        xPosition: 120,
        text: orderProductsVariant.quantity.toString(),
      })

      const pricePerUnitFormated = (
        productVariant.pricePerUnit / 100
      ).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })

      infoLine.addColumn({
        text: pricePerUnitFormated,
      })

      const priceTotalFormated = (
        (productVariant.pricePerUnit * orderProductsVariant.quantity) /
        100
      ).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })

      infoLine.addColumn({
        text: priceTotalFormated,
      })

      total += productVariant.pricePerUnit * orderProductsVariant.quantity
    })

    doc.addLine()
    doc.addLine()

    const paymentTypeLine = doc.addLine()
    paymentTypeLine.addColumn({
      text: `PAGAMENTO: ${translation[order.payment?.method ?? 'NOT-PAYED']}`,
    })
    doc.addLine()

    const paymentInfoLine = doc.addLine()
    const paymentFormated = ((order.payment?.amount ?? 0) / 100).toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL',
      },
    )

    paymentInfoLine.addColumn({
      text: `VALOR PAGO:`,
    })

    paymentInfoLine.addColumn({
      xPosition: 180,
      text: paymentFormated,
    })

    const totalInfoLine = doc.addLine()
    const totalFormated = (total / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

    totalInfoLine.addColumn({
      text: `VALOR TOTAL:`,
    })

    totalInfoLine.addColumn({
      xPosition: 180,
      text: totalFormated,
    })

    const refundInfoLine = doc.addLine()
    const refundFormated = (
      ((order.payment?.amount ?? 0) - total) /
      100
    ).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

    refundInfoLine.addColumn({
      text: `TROCO:`,
    })

    refundInfoLine.addColumn({
      text: refundFormated,
      xPosition: 180,
    })

    await this.docPersistence.savePdf(doc)

    return right(null)
  }
}
