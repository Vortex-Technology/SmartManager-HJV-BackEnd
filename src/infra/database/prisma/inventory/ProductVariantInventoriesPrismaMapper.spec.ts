import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { ProductVariantInventoriesPrismaMapper } from './ProductVariantInventoriesPrismaMapper'
import { ProductVariantInventory } from '@modules/inventory/entities/ProductVariantInventory'

describe('ProductVariantInventories prisma mapper', () => {
  it('should be able to map so entity product variants inventories', () => {
    const productVariants = {
      id: '1',
      inventoryId: 'inventoryId-1',
      productVariantId: 'productVariantId-1',
      quantity: 1,
      createdAt: new Date(),
      deletedAt: new Date(),
      updatedAt: new Date(),
    }

    const result =
      ProductVariantInventoriesPrismaMapper.toEntity(productVariants)

    const inventoryId = new UniqueEntityId('inventoryId-1')
    const productVariantId = new UniqueEntityId('productVariantId-1')

    //  duvida!
    // expect(result.inventoryId).toBe(inventoryId.toString())

    expect(result.inventoryId.equals(inventoryId)).toBe(true)
    expect(result.productVariantId.equals(productVariantId)).toBe(true)
    expect(result.quantity).toBe(1)
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
  })

  it('should be able to map to prisma', () => {
    const productVariants = ProductVariantInventory.create(
      {
        inventoryId: new UniqueEntityId('inventoryId-1'),
        productVariantId: new UniqueEntityId('productVariantId-1'),
        quantity: 1,
        createdAt: new Date(),
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
      new UniqueEntityId('id-1'),
    )

    const result =
      ProductVariantInventoriesPrismaMapper.toPrisma(productVariants)
    const inventoryId = new UniqueEntityId('inventoryId-1')
    const productVariantId = new UniqueEntityId('productVariantId-1')
    const id = new UniqueEntityId('id-1')

    expect(result.id).toBe(id.toString())
    expect(result.inventoryId).toBe(inventoryId.toString())
    expect(result.productVariantId).toBe(productVariantId.toString())
    expect(result.quantity).toBe(1)
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
  })
})
