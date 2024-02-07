import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { OrdersProductsVariantsPrismaMapper } from './OrdersProductsVariantsPrismaMapper'
import { OrderProductVariant } from '@modules/order/entities/OrderProductVariant'

describe('Orders products variants prisma mapper', async () => {
  it('should be able to map to entity order product variants', () => {
    const result = OrdersProductsVariantsPrismaMapper.toEntity({
      id: '1',
      orderId: '2',
      productVariantId: '3',
      quantity: 3,
    })

    // expect(result.id.toString()).toStrictEqual('1')
    expect(result.orderId.toString()).toBe('2')
    expect(result.productVariantId.toString()).toBe('3')
    expect(result.quantity).toBe(3)
  })

  it('should be able to map to entity order product variants', () => {
    const body = OrderProductVariant.create(
      {
        orderId: new UniqueEntityId('order-1'),
        productVariantId: new UniqueEntityId('productVariant-1'),
        quantity: 3,
      },
      new UniqueEntityId('1'),
    )

    const result = OrdersProductsVariantsPrismaMapper.toPrisma(body)

    const orderId = new UniqueEntityId('order-1')
    const productVariantId = new UniqueEntityId('productVariant-1')

    expect(result.orderId).toBe(orderId.toString())
    expect(result.productVariantId).toBe(productVariantId.toString())
    expect(result.quantity).toBe(3)
  })
})
