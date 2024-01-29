import { Protocol } from '@shared/core/valueObjects/Protocol'
import { OrdersPrismaMapper } from './OrdersPrismaMapper'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { Order } from '@modules/order/entities/Order'

describe('Orders prisma mapper', async () => {
  it('should be able to map  a entity orders', async () => {
    const result = OrdersPrismaMapper.toEntity({
      id: '1',
      companyId: 'company-1',
      marketId: 'market-1',
      closedAt: new Date(),
      deletedAt: new Date(),
      discount: 10,
      openedAt: new Date(),
      protocol: new Protocol().toValue(),
      refundedAt: new Date(),
      subTotal: 11,
      total: 100,
      updatedAt: new Date(),
      closedByCollaboratorId: 'collaborator-1',
      openedByCollaboratorId: 'collaborator-1',
      orderPayment: {
        amount: 100,
        id: 1,
        method: 'CASH',
        processedAt: new Date(),
        status: 'PAYED',
      },
      orderPaymentId: 1,
    })

    const id = new UniqueEntityId('1')
    const companyId = new UniqueEntityId('company-1')
    const marketId = new UniqueEntityId('market-1')

    expect(result.id).toStrictEqual(id)
    expect(result.companyId).toStrictEqual(companyId)
    expect(result.marketId).toStrictEqual(marketId)
    expect(result.openedAt).toBeInstanceOf(Date)
    expect(result.closedAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.refundedAt).toBeInstanceOf(Date)
    expect(result.discount).toBe(10)
    expect(result.subTotal).toBe(11)
    expect(result.total).toBe(100)
  })

  it('should be able to map to prisma orders', () => {
    const body = Order.create(
      {
        companyId: new UniqueEntityId('company-1'),
        marketId: new UniqueEntityId('market-1'),
        closedAt: new Date(),
        deletedAt: new Date(),
        discount: 10,
        openedAt: new Date(),
        protocol: new Protocol(),
        refundedAt: new Date(),
        subTotal: 11,
        total: 100,
        updatedAt: new Date(),
        openedById: new UniqueEntityId(),
        closedById: new UniqueEntityId(),
      },
      new UniqueEntityId('1'),
    )

    const result = OrdersPrismaMapper.toPrisma(body)

    const id = new UniqueEntityId('1')
    const companyId = new UniqueEntityId('company-1')
    const marketId = new UniqueEntityId('market-1')

    expect(result.id).toStrictEqual(id.toString())
    expect(result.companyId).toStrictEqual(companyId.toString())
    expect(result.marketId).toStrictEqual(marketId.toString())
    expect(result.openedAt).toBeInstanceOf(Date)
    expect(result.closedAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.refundedAt).toBeInstanceOf(Date)
    expect(result.discount).toBe(10)
    expect(result.subTotal).toBe(11)
    expect(result.total).toBe(100)
  })
})
