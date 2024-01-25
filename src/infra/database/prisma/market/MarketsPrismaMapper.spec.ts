import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { MarketsPrismaMapper } from './MarketsPrismaMapper'
import { Market } from '@modules/market/entities/Market'
import { makeAddress } from '@test/factories/valueObjects/address/makeAddress'
import { makeInventory } from '@test/factories/modules/inventory/makeInventory'

describe('Markets prisma mapper', () => {
  it('should be able to map to entity markets', () => {
    const market = {
      id: '1',
      address: {
        id: 123,
        street: 'New York',
        number: '123',
        complement: 'complement',
        neighborhood: 'New York',
        city: 'New York',
        state: 'United States',
        postalCode: '123',
        country: 'United States',
      },
      addressId: 1,
      companyId: 'companyId-1',
      inventoryId: 'inventoryId-1',
      tradeName: 'tradeName-1',
      createdAt: new Date(),
      deletedAt: new Date(),
      updatedAt: new Date(),
    }

    const result = MarketsPrismaMapper.toEntity(market)
    const companyId = new UniqueEntityId('companyId-1')
    const inventoryId = new UniqueEntityId('inventoryId-1')

    expect(result.companyId).toStrictEqual(companyId)
    expect(result.inventoryId).toStrictEqual(inventoryId)
    expect(result.tradeName).toBe('tradeName-1')
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
  })

  it('should be able to create without address prisma', () => {
    const market = Market.create(
      {
        companyId: new UniqueEntityId('companyId-1'),
        inventoryId: new UniqueEntityId('inventoryId-1'),
        tradeName: 'tradeName-1',
        createdAt: new Date(),
        deletedAt: new Date(),
        updatedAt: new Date(),
        address: makeAddress(),
        inventory: makeInventory({}, new UniqueEntityId('inventoryId-1')),
      },
      new UniqueEntityId('id-1'),
    )

    const result = MarketsPrismaMapper.toCreateWithoutAddressPrisma(market)

    expect(result.company.connect?.id).toBe('companyId-1')
    expect(result.inventory.create?.id).toBe('inventoryId-1')
    expect(result.tradeName).toBe('tradeName-1')

    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)

    expect(result.id).toBe('id-1')
  })

  it('should be able to update a prisma market', () => {
    const market = Market.create({
      companyId: new UniqueEntityId('companyId-1'),
      inventoryId: new UniqueEntityId('inventoryId-1'),
      tradeName: 'tradeName-1',
      createdAt: new Date(),
      deletedAt: new Date(),
      updatedAt: new Date(),
      address: makeAddress(),
    })

    const result = MarketsPrismaMapper.toUpdatePrisma(market)

    expect(result.tradeName).toBe('tradeName-1')
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
  })

  it('not should be able to create market without have an inventory', () => {
    const market = Market.create({
      companyId: new UniqueEntityId('companyId-1'),
      inventoryId: new UniqueEntityId('inventoryId-1'),
      tradeName: 'tradeName-1',
      createdAt: new Date(),
      deletedAt: new Date(),
      updatedAt: new Date(),
      address: makeAddress(),
    })

    expect(async () => {
      MarketsPrismaMapper.toCreateWithoutAddressPrisma(market)
    })
      .rejects.toBeInstanceOf(Error)
      .catch((err) => {
        throw err
      })
  })

  it.skip('should be able to map a market to create prisma')
})
