import { ProductUnitType } from '@modules/product/entities/Product'
import { ProductVariantsPrismaMapper } from './ProductVariantsPrismaMapper'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { ProductVariant } from '@modules/product/entities/ProductVariant'

describe('Product variants prisma mapper', () => {
  it('should be able to map a entity product variants', () => {
    const productVariants = {
      id: 'id-1',
      name: 'product-1',
      description: 'description',
      model: 'model',
      pricePerUnit: 1000,
      brand: 'brand',
      image: null,
      barCode: 'barcode',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
      unitType: ProductUnitType.KILOS,
      productId: 'productId-1',
    }

    const result = ProductVariantsPrismaMapper.toEntity(productVariants)
    const id = new UniqueEntityId('id-1')
    const productId = new UniqueEntityId('productId-1')

    expect(result.id).toStrictEqual(id)
    expect(result.name).toBe('product-1')
    expect(result.description).toBe('description')
    expect(result.model).toBe('model')
    expect(result.pricePerUnit).toBe(1000)
    expect(result.brand).toBe('brand')
    expect(result.barCode).toBe('barcode')
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
    expect(result.unitType).toBe(ProductUnitType.KILOS)
    expect(result.productId).toStrictEqual(productId)
  })

  it('should be able to map a prisma product variants', () => {
    const productVariants = ProductVariant.create(
      {
        name: 'product-1',
        description: 'description',
        model: 'model',
        pricePerUnit: 1000,
        brand: 'brand',
        image: null,
        barCode: 'barcode',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        unitType: ProductUnitType.KILOS,
        productId: new UniqueEntityId('productId-1'),
      },
      new UniqueEntityId('id-1'),
    )

    const result = ProductVariantsPrismaMapper.toPrisma(productVariants)
    const id = new UniqueEntityId('id-1')
    const productId = new UniqueEntityId('productId-1')

    expect(result.id).toStrictEqual(id.toString())
    expect(result.name).toBe('product-1')
    expect(result.description).toBe('description')
    expect(result.model).toBe('model')
    expect(result.pricePerUnit).toBe(1000)
    expect(result.brand).toBe('brand')
    expect(result.barCode).toBe('barcode')
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
    expect(result.unitType).toBe(ProductUnitType.KILOS)
    expect(result.productId).toStrictEqual(productId.toString())
  })
})
