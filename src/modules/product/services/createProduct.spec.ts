import { AdministratorInMemoryRepository } from '@test/repositories/modules/administrator/AdministratorInMemoryRepository'
import { makeAdministrator } from '@test/factories/modules/administrator/makeAdministrator'
import { AdministratorRole } from '@modules/administrator/entities/Administrator'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { AdministratorNotFount } from '@modules/administrator/errors/AdministratorNotFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { makeProductCategory } from '@test/factories/modules/product/makeProductCategory'
import { ProductCategoryInMemoryRepository } from '@test/repositories/modules/product/ProductCategoryInMemoryRepository'
import { CreateProductService } from './createProduct.service'
import { ProductInMemoryRepository } from '@test/repositories/modules/product/ProductInMemoryRepository'
import { ProductVariantInMemoryRepository } from '@test/repositories/modules/product/ProductVariantInMemoryRepository'
import { Product, ProductUnitType } from '../entities/Product'
import { makeProductVariant } from '@test/factories/modules/product/makeProductVariant'
import { ProductVariantAlreadyExistsWithSame } from '../errors/ProductVariantAlreadyExistsWithSame'
import { AllProductVariantAlreadyExists } from '../errors/AllProductVariantAlreadyExists'

let administratorInMemoryRepository: AdministratorInMemoryRepository
let productCategoryInMemoryRepository: ProductCategoryInMemoryRepository
let productInMemoryRepository: ProductInMemoryRepository
let productVariantInMemoryRepository: ProductVariantInMemoryRepository

let sut: CreateProductService

describe('Create product', () => {
  beforeEach(() => {
    administratorInMemoryRepository = new AdministratorInMemoryRepository()
    productCategoryInMemoryRepository = new ProductCategoryInMemoryRepository()
    productVariantInMemoryRepository = new ProductVariantInMemoryRepository()
    productInMemoryRepository = new ProductInMemoryRepository(
      productVariantInMemoryRepository,
    )

    sut = new CreateProductService(
      administratorInMemoryRepository,
      productCategoryInMemoryRepository,
      productInMemoryRepository,
      productVariantInMemoryRepository,
    )
  })

  it('should be able to create a new product', async () => {
    const administrator = makeAdministrator(
      {
        role: AdministratorRole.FULL_ACCESS,
      },
      new UniqueEntityId('1'),
    )

    await administratorInMemoryRepository.create(administrator)

    const response = await sut.execute({
      creatorId: '1',
      name: 'Product category',
      categories: ['strong category'],
      variants: [
        {
          barCode: '123',
          brand: 'vanilla',
          name: 'Product variant',
          pricePerUnit: 1000,
          unitType: ProductUnitType.UNIT,
        },
      ],
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.product).toBeInstanceOf(Product)
      expect(productInMemoryRepository.products).toHaveLength(1)
      expect(productVariantInMemoryRepository.productVariants).toHaveLength(1)
      expect(productCategoryInMemoryRepository.productCategories).toHaveLength(
        1,
      )
      expect(
        productVariantInMemoryRepository.productVariants[0].barCode,
      ).toEqual('123')
    }
  })

  it("not should be able to create a new product if administrator doesn't exist", async () => {
    const response = await sut.execute({
      creatorId: 'inexistent-creator-id',
      name: 'Product category',
      categories: ['strong category'],
      variants: [
        {
          barCode: '123',
          brand: 'vanilla',
          name: 'Product variant',
          pricePerUnit: 1000,
          unitType: ProductUnitType.UNIT,
        },
      ],
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(AdministratorNotFount)
  })

  it("not should be able to create a new product if administrator doesn't have necessary role", async () => {
    const administrator = makeAdministrator(
      {
        role: AdministratorRole.VIEWER,
      },
      new UniqueEntityId('1'),
    )

    await administratorInMemoryRepository.create(administrator)

    const response = await sut.execute({
      creatorId: '1',
      name: 'Product category',
      categories: ['strong category'],
      variants: [
        {
          barCode: '123',
          brand: 'vanilla',
          name: 'Product variant',
          pricePerUnit: 1000,
          unitType: ProductUnitType.UNIT,
        },
      ],
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it('should be able to create a new product with many categories and variants', async () => {
    const administrator = makeAdministrator(
      {
        role: AdministratorRole.FULL_ACCESS,
      },
      new UniqueEntityId('1'),
    )

    await administratorInMemoryRepository.create(administrator)

    const response = await sut.execute({
      creatorId: '1',
      name: 'Product category',
      categories: ['strong category', 'strong category 2'],
      variants: [
        {
          barCode: '123',
          brand: 'vanilla',
          name: 'Product variant',
          pricePerUnit: 1000,
          unitType: ProductUnitType.UNIT,
        },
        {
          barCode: '1234',
          brand: 'vanilla 2',
          name: 'Product variant 2',
          pricePerUnit: 2000,
          unitType: ProductUnitType.UNIT,
        },
      ],
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.product).toBeInstanceOf(Product)
      expect(productInMemoryRepository.products).toHaveLength(1)
      expect(productVariantInMemoryRepository.productVariants).toHaveLength(2)
      expect(productCategoryInMemoryRepository.productCategories).toHaveLength(
        2,
      )
    }
  })

  it('should be able to create a new product with many existent and inexistent categories', async () => {
    const administrator = makeAdministrator(
      {
        role: AdministratorRole.FULL_ACCESS,
      },
      new UniqueEntityId('1'),
    )
    const productCategory = makeProductCategory({
      name: 'strong category',
    })

    await administratorInMemoryRepository.create(administrator)
    await productCategoryInMemoryRepository.create(productCategory)

    const response = await sut.execute({
      creatorId: '1',
      name: 'Product category',
      categories: ['strong category', 'strong category 2'],
      variants: [
        {
          barCode: '123',
          brand: 'vanilla',
          name: 'Product variant',
          pricePerUnit: 1000,
          unitType: ProductUnitType.UNIT,
        },
      ],
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.product).toBeInstanceOf(Product)
      expect(productInMemoryRepository.products).toHaveLength(1)
      expect(productVariantInMemoryRepository.productVariants).toHaveLength(1)
      expect(productCategoryInMemoryRepository.productCategories).toHaveLength(
        2,
      )
    }
  })

  it('should be able to create a new product with many existent categories', async () => {
    const administrator = makeAdministrator(
      {
        role: AdministratorRole.FULL_ACCESS,
      },
      new UniqueEntityId('1'),
    )
    const productCategory = makeProductCategory({
      name: 'strong category',
    })
    const productCategory2 = makeProductCategory({
      name: 'strong category 2',
    })
    const productCategory3 = makeProductCategory({
      name: 'strong category 3',
    })

    await administratorInMemoryRepository.create(administrator)
    await productCategoryInMemoryRepository.create(productCategory)
    await productCategoryInMemoryRepository.create(productCategory2)
    await productCategoryInMemoryRepository.create(productCategory3)

    const response = await sut.execute({
      creatorId: '1',
      name: 'Product category',
      categories: ['strong category', 'strong category 2', 'strong category 3'],
      variants: [
        {
          barCode: '123',
          brand: 'vanilla',
          name: 'Product variant',
          pricePerUnit: 1000,
          unitType: ProductUnitType.UNIT,
        },
      ],
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.product).toBeInstanceOf(Product)
      expect(productInMemoryRepository.products).toHaveLength(1)
      expect(productVariantInMemoryRepository.productVariants).toHaveLength(1)
      expect(productCategoryInMemoryRepository.productCategories).toHaveLength(
        3,
      )
    }
  })

  it('should be able to create a new product if one of variants already exists but it return errors with response', async () => {
    const administrator = makeAdministrator(
      {
        role: AdministratorRole.FULL_ACCESS,
      },
      new UniqueEntityId('1'),
    )
    const productVariant = makeProductVariant({
      name: 'pão',
      barCode: '123',
    })

    await administratorInMemoryRepository.create(administrator)
    await productVariantInMemoryRepository.create(productVariant)

    const response = await sut.execute({
      creatorId: '1',
      name: 'Product category',
      categories: ['strong category'],
      variants: [
        {
          barCode: '123',
          brand: 'vanilla',
          name: 'Product variant',
          pricePerUnit: 1000,
          unitType: ProductUnitType.UNIT,
        },
        {
          barCode: '12456',
          brand: 'vanilla',
          name: 'Product variant 2',
          pricePerUnit: 2000,
          unitType: ProductUnitType.UNIT,
        },
      ],
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.product).toBeInstanceOf(Product)
      expect(productInMemoryRepository.products).toHaveLength(1)
      expect(productVariantInMemoryRepository.productVariants).toHaveLength(2)
      expect(productCategoryInMemoryRepository.productCategories).toHaveLength(
        1,
      )
      expect(response.value.errors).toHaveLength(1)
      expect(response.value.errors[0]).toBeInstanceOf(
        ProductVariantAlreadyExistsWithSame,
      )
    }
  })

  it('not should be able to create a new product if all variants already exists', async () => {
    const administrator = makeAdministrator(
      {
        role: AdministratorRole.FULL_ACCESS,
      },
      new UniqueEntityId('1'),
    )
    const productVariant = makeProductVariant({
      name: 'pão',
      barCode: '123',
    })

    const productVariant2 = makeProductVariant({
      name: 'pão',
      barCode: '131315',
    })

    await administratorInMemoryRepository.create(administrator)
    await productVariantInMemoryRepository.create(productVariant)
    await productVariantInMemoryRepository.create(productVariant2)

    const response = await sut.execute({
      creatorId: '1',
      name: 'Product category',
      categories: ['strong category'],
      variants: [
        {
          barCode: '123',
          brand: 'vanilla',
          name: 'Product variant',
          pricePerUnit: 1000,
          unitType: ProductUnitType.UNIT,
        },
        {
          barCode: '131315',
          brand: 'vanilla',
          name: 'Product variant 2',
          pricePerUnit: 2000,
          unitType: ProductUnitType.UNIT,
        },
      ],
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(AllProductVariantAlreadyExists)
  })
})
