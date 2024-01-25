import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { ProductCategoriesPrismaMapper } from './ProductCategoriesPrismaMapper'
import { ProductCategory } from '@modules/product/entities/ProductCategory'

describe('Product categories prisma mapper', () => {
  it('should be able to map a entity categories', () => {
    const categories = {
      id: 'id-1',
      name: 'category-1',
      description: 'description',
      createdAt: new Date(),
      deletedAt: new Date(),
    }

    const result = ProductCategoriesPrismaMapper.toEntity(categories)
    const id = new UniqueEntityId('id-1')

    expect(result.id).toStrictEqual(id)
    expect(result.name).toBe('category-1')
    expect(result.description).toBe('description')
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
  })

  it('should be able to map a prisma product category', () => {
    const categories = ProductCategory.create(
      {
        name: 'category-1',
        description: 'description',
        createdAt: new Date(),
        deletedAt: new Date(),
      },
      new UniqueEntityId('id-1'),
    )

    const result = ProductCategoriesPrismaMapper.toPrisma(categories)
    const id = new UniqueEntityId('id-1')

    expect(result.id).toStrictEqual(id.toString())
    expect(result.name).toBe('category-1')
    expect(result.description).toBe('description')
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
  })
})
