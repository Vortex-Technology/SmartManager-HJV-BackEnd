import { VerifyPermissionsOfCollaboratorInMarketService } from '@modules/interceptors/services/VerifyPermissionsOfCollaboratorInMarket.service'
import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { OrdersRepository } from '../repositories/OrdersRepository'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { MarketNotFound } from '@modules/market/errors/MarketNorFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import JsPDF from 'jspdf'
import { OrderNotFound } from '../errors/OrderNotFound'
import { ProductVariantsRepository } from '@modules/product/repositories/ProductVariantsRepository'
import { ProductVariantNotFound } from '@modules/product/errors/ProductVariantNotFound'
import { OrderProductVariantNotFound } from '../errors/OrderProductVariantNotFound'
import path from 'path'

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
  MONEY: 'Dinheiro',
  CARD: 'Cartão',
  'NOT-PAYED': 'NÃO PAGO',
}

@Injectable()
export class CloseOrderService {
  constructor(
    private readonly verifyPermissions: VerifyPermissionsOfCollaboratorInMarketService,
    private readonly ordersRepository: OrdersRepository,
    private readonly productsVariantsRepository: ProductVariantsRepository,
  ) {}

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

    const doc = new JsPDF()
    let finalIndex = 0
    let total = 0

    doc.setFont('helvetica', '', 700)
    doc.setFontSize(32)
    doc.text(market.tradeName, 5, 10)

    doc.setFontSize(14)
    doc.text('PRODUTO', 5, 30)
    doc.text('QNTD |', 70, 30)
    doc.text('VLR UNT |', 120, 30)
    doc.text('VLR TOTAL', 170, 30)

    productsVariants.forEach((productVariant, i) => {
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

      doc.text(productVariant.name, 5, 39 + i * 6)
      doc.text(orderProductsVariant.quantity.toString(), 70, 39 + i * 6)
      doc.text(
        (productVariant.pricePerUnit / 1000).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        120,
        39 + i * 6,
      )

      doc.text(
        (
          (productVariant.pricePerUnit * orderProductsVariant.quantity) /
          1000
        ).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        170,
        39 + i * 6,
      )

      finalIndex = i + 1
      total =
        total + productVariant.pricePerUnit * orderProductsVariant.quantity
    })

    doc.text(
      `Pago em: ${translation[order.payment?.method ?? 'NOT-PAYED']}`,
      5,
      48 + finalIndex * 6,
    )
    finalIndex++

    doc.text(`Pagamento: `, 5, 48 + finalIndex * 6)
    doc.text(
      (Number(order.payment?.amount ?? 0) / 1000).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      170,
      48 + finalIndex * 6,
    )
    finalIndex++

    doc.text(`Valor total: `, 5, 48 + finalIndex * 6)
    doc.text(
      (total / 1000).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      170,
      48 + finalIndex * 6,
    )
    finalIndex++

    doc.text(`Troco: `, 5, 48 + finalIndex * 6)
    doc.text(
      ((order.payment?.amount ?? 0 - total) / 1000 <= 0
        ? 0
        : (order.payment?.amount ?? 0 - total) / 1000
      ).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      170,
      48 + finalIndex * 6,
    )

    doc.save(path.join(__dirname, 'pdf.pdf'))

    return right(null)
  }
}
