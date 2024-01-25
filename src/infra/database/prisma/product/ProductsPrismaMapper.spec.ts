import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { ProductsPrismaMapper } from './ProductsPrismaMapper'
import { Product } from '@modules/product/entities/Product'

describe('Products prisma mapper', () => {
  it('should be able to map a entity product', () => {
    const product = {
      id: 'id-1',
      name: 'product name',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
    }

    const result = ProductsPrismaMapper.toEntity(product)
    const productId = new UniqueEntityId('id-1')

    expect(result.id).toStrictEqual(productId)
    expect(result.name).toBe('product name')
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
  })

  it('should be able to map a prisma product', () => {
    const product = Product.create(
      {
        name: 'product name',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      },
      new UniqueEntityId('id-1'),
    )

    const result = ProductsPrismaMapper.toPrisma(product)
    const productId = new UniqueEntityId('id-1')

    expect(result.id).toBe(productId.toString())
    expect(result.name).toBe('product name')
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
  })
})
