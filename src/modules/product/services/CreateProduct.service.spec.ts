import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { makeProductCategory } from '@test/factories/modules/product/makeProductCategory'
import { CreateProductService } from './CreateProduct.service'
import { Product, ProductUnitType } from '../entities/Product'
import { makeProductVariant } from '@test/factories/modules/product/makeProductVariant'
import { ProductVariantAlreadyExistsWithSame } from '../errors/ProductVariantAlreadyExistsWithSame'
import { AllProductVariantAlreadyExists } from '../errors/AllProductVariantAlreadyExists'
import { makeInventory } from '@test/factories/modules/inventory/makeInventory'
import { InventoriesInMemoryRepository } from '@test/repositories/modules/inventory/InventoriesInMemoryRepository'
import { ProductVariantInventoriesInMemoryRepository } from '@test/repositories/modules/inventory/ProductVariantInventoriesInMemoryRepository'
import { CollaboratorsInMemoryRepository } from '@test/repositories/modules/collaborator/CollaboratorsInMemoryRepository'
import { ProductCategoriesInMemoryRepository } from '@test/repositories/modules/product/ProductCategoriesInMemoryRepository'
import { ProductsInMemoryRepository } from '@test/repositories/modules/product/ProductsInMemoryRepository'
import { ProductVariantsInMemoryRepository } from '@test/repositories/modules/product/ProductVariantsInMemoryRepository'
import { makeManager } from '@test/factories/modules/manager/makeManager'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { makeSeller } from '@test/factories/modules/seller/makeSeller'

let collaboratorsInMemoryRepository: CollaboratorsInMemoryRepository
let productCategoriesInMemoryRepository: ProductCategoriesInMemoryRepository
let productsInMemoryRepository: ProductsInMemoryRepository
let productVariantsInMemoryRepository: ProductVariantsInMemoryRepository
let inventoriesInMemoryRepository: InventoriesInMemoryRepository
let productVariantInventoriesInMemoryRepository: ProductVariantInventoriesInMemoryRepository

let sut: CreateProductService

describe('Create product', () => {
  beforeEach(() => {
    collaboratorsInMemoryRepository = new CollaboratorsInMemoryRepository()
    productCategoriesInMemoryRepository =
      new ProductCategoriesInMemoryRepository()
    productVariantsInMemoryRepository = new ProductVariantsInMemoryRepository()
    productsInMemoryRepository = new ProductsInMemoryRepository(
      productVariantsInMemoryRepository,
    )
    productVariantInventoriesInMemoryRepository =
      new ProductVariantInventoriesInMemoryRepository()
    inventoriesInMemoryRepository = new InventoriesInMemoryRepository(
      productVariantInventoriesInMemoryRepository,
    )

    sut = new CreateProductService(
      collaboratorsInMemoryRepository,
      productCategoriesInMemoryRepository,
      productsInMemoryRepository,
      productVariantsInMemoryRepository,
      inventoriesInMemoryRepository,
    )
  })

  it('should be able to create a new product', async () => {
    const collaborator = makeManager({}, new UniqueEntityId('manager-1'))

    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      creatorId: 'manager-1',
      name: 'Product category',
      categories: ['strong category'],
      variants: [
        {
          barCode: '123',
          brand: 'vanilla',
          name: 'Product variant',
          pricePerUnit: 1000,
          unitType: ProductUnitType.UNIT,
          quantity: 10,
        },
      ],
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.product).toBeInstanceOf(Product)
      expect(productsInMemoryRepository.products).toHaveLength(1)
      expect(productVariantsInMemoryRepository.productVariants).toHaveLength(1)
      expect(
        productCategoriesInMemoryRepository.productCategories,
      ).toHaveLength(1)
      expect(inventoriesInMemoryRepository.inventories).toHaveLength(1)
      expect(
        productVariantInventoriesInMemoryRepository.productVariantInventories,
      ).toHaveLength(1)
      expect(
        productVariantsInMemoryRepository.productVariants[0].barCode,
      ).toEqual('123')
    }
  })

  it("not should be able to create a new product if collaborator doesn't exist", async () => {
    const response = await sut.execute({
      creatorId: 'inexistent-manager-id',
      name: 'Product category',
      categories: ['strong category'],
      variants: [
        {
          barCode: '123',
          brand: 'vanilla',
          name: 'Product variant',
          pricePerUnit: 1000,
          unitType: ProductUnitType.UNIT,
          quantity: 10,
        },
      ],
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CollaboratorNotFound)
  })

  it("not should be able to create a new product if collaborator doesn't have necessary role", async () => {
    const collaborator = makeSeller({}, new UniqueEntityId('seller-1'))

    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      creatorId: 'seller-1',
      name: 'Product category',
      categories: ['strong category'],
      variants: [
        {
          barCode: '123',
          brand: 'vanilla',
          name: 'Product variant',
          pricePerUnit: 1000,
          unitType: ProductUnitType.UNIT,
          quantity: 10,
        },
      ],
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it('should be able to create a new product with many categories and variants', async () => {
    const collaborator = makeManager({}, new UniqueEntityId('manager-1'))

    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      creatorId: 'manager-1',
      name: 'Product category',
      categories: ['strong category', 'strong category 2'],
      variants: [
        {
          barCode: '123',
          brand: 'vanilla',
          name: 'Product variant',
          pricePerUnit: 1000,
          unitType: ProductUnitType.UNIT,
          quantity: 10,
        },
        {
          barCode: '1234',
          brand: 'vanilla 2',
          name: 'Product variant 2',
          pricePerUnit: 2000,
          unitType: ProductUnitType.UNIT,
          quantity: 10,
        },
      ],
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.product).toBeInstanceOf(Product)
      expect(productsInMemoryRepository.products).toHaveLength(1)
      expect(productVariantsInMemoryRepository.productVariants).toHaveLength(2)
      expect(
        productCategoriesInMemoryRepository.productCategories,
      ).toHaveLength(2)
      expect(inventoriesInMemoryRepository.inventories).toHaveLength(1)
      expect(
        productVariantInventoriesInMemoryRepository.productVariantInventories,
      ).toHaveLength(2)
    }
  })

  it('should be able to create a new product with many existent and inexistent categories', async () => {
    const collaborator = makeManager({}, new UniqueEntityId('manager-1'))
    const productCategory = makeProductCategory({
      name: 'strong category',
    })

    await collaboratorsInMemoryRepository.create(collaborator)
    await productCategoriesInMemoryRepository.create(productCategory)

    const response = await sut.execute({
      creatorId: 'manager-1',
      name: 'Product category',
      categories: ['strong category', 'strong category 2'],
      variants: [
        {
          barCode: '123',
          brand: 'vanilla',
          name: 'Product variant',
          pricePerUnit: 1000,
          unitType: ProductUnitType.UNIT,
          quantity: 10,
        },
      ],
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.product).toBeInstanceOf(Product)
      expect(productsInMemoryRepository.products).toHaveLength(1)
      expect(productVariantsInMemoryRepository.productVariants).toHaveLength(1)
      expect(
        productCategoriesInMemoryRepository.productCategories,
      ).toHaveLength(2)
      expect(inventoriesInMemoryRepository.inventories).toHaveLength(1)
      expect(
        productVariantInventoriesInMemoryRepository.productVariantInventories,
      ).toHaveLength(1)
    }
  })

  it('should be able to create a new product with many existent categories', async () => {
    const collaborator = makeManager({}, new UniqueEntityId('manager-1'))
    const productCategory = makeProductCategory({
      name: 'strong category',
    })
    const productCategory2 = makeProductCategory({
      name: 'strong category 2',
    })
    const productCategory3 = makeProductCategory({
      name: 'strong category 3',
    })

    await collaboratorsInMemoryRepository.create(collaborator)
    await productCategoriesInMemoryRepository.create(productCategory)
    await productCategoriesInMemoryRepository.create(productCategory2)
    await productCategoriesInMemoryRepository.create(productCategory3)

    const response = await sut.execute({
      creatorId: 'manager-1',
      name: 'Product category',
      categories: ['strong category', 'strong category 2', 'strong category 3'],
      variants: [
        {
          barCode: '123',
          brand: 'vanilla',
          name: 'Product variant',
          pricePerUnit: 1000,
          unitType: ProductUnitType.UNIT,
          quantity: 10,
        },
      ],
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.product).toBeInstanceOf(Product)
      expect(productsInMemoryRepository.products).toHaveLength(1)
      expect(productVariantsInMemoryRepository.productVariants).toHaveLength(1)
      expect(
        productCategoriesInMemoryRepository.productCategories,
      ).toHaveLength(3)
      expect(inventoriesInMemoryRepository.inventories).toHaveLength(1)
      expect(
        productVariantInventoriesInMemoryRepository.productVariantInventories,
      ).toHaveLength(1)
    }
  })

  it('should be able to create a new product if one of variants already exists but it return errors with response', async () => {
    const collaborator = makeManager({}, new UniqueEntityId('manager-1'))
    const productVariant = makeProductVariant({
      name: 'pão',
      barCode: '123',
    })

    await collaboratorsInMemoryRepository.create(collaborator)
    await productVariantsInMemoryRepository.create(productVariant)

    const response = await sut.execute({
      creatorId: 'manager-1',
      name: 'Product category',
      categories: ['strong category'],
      variants: [
        {
          barCode: '123',
          brand: 'vanilla',
          name: 'Product variant',
          pricePerUnit: 1000,
          unitType: ProductUnitType.UNIT,
          quantity: 10,
        },
        {
          barCode: '12456',
          brand: 'vanilla',
          name: 'Product variant 2',
          pricePerUnit: 2000,
          unitType: ProductUnitType.UNIT,
          quantity: 10,
        },
      ],
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.product).toBeInstanceOf(Product)
      expect(productsInMemoryRepository.products).toHaveLength(1)
      expect(productVariantsInMemoryRepository.productVariants).toHaveLength(2)
      expect(
        productCategoriesInMemoryRepository.productCategories,
      ).toHaveLength(1)
      expect(response.value.errors).toHaveLength(1)
      expect(response.value.errors[0]).toBeInstanceOf(
        ProductVariantAlreadyExistsWithSame,
      )
      expect(inventoriesInMemoryRepository.inventories).toHaveLength(1)
      expect(
        productVariantInventoriesInMemoryRepository.productVariantInventories,
      ).toHaveLength(1)
    }
  })

  it('not should be able to create a new product if all variants already exists', async () => {
    const collaborator = makeManager({}, new UniqueEntityId('manager-1'))
    const productVariant = makeProductVariant({
      name: 'pão',
      barCode: '123',
    })

    const productVariant2 = makeProductVariant({
      name: 'pão',
      barCode: '131315',
    })

    await collaboratorsInMemoryRepository.create(collaborator)
    await productVariantsInMemoryRepository.create(productVariant)
    await productVariantsInMemoryRepository.create(productVariant2)

    const response = await sut.execute({
      creatorId: 'manager-1',
      name: 'Product category',
      categories: ['strong category'],
      variants: [
        {
          barCode: '123',
          brand: 'vanilla',
          name: 'Product variant',
          pricePerUnit: 1000,
          unitType: ProductUnitType.UNIT,
          quantity: 10,
        },
        {
          barCode: '131315',
          brand: 'vanilla',
          name: 'Product variant 2',
          pricePerUnit: 2000,
          unitType: ProductUnitType.UNIT,
          quantity: 10,
        },
      ],
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(AllProductVariantAlreadyExists)
  })

  it('should be able to create a new product with an existent inventory', async () => {
    const collaborator = makeManager({}, new UniqueEntityId('manager-1'))
    const inventory = makeInventory({}, new UniqueEntityId('inventory-id'))

    await collaboratorsInMemoryRepository.create(collaborator)
    await inventoriesInMemoryRepository.create(inventory)

    const response = await sut.execute({
      creatorId: 'manager-1',
      name: 'Product category',
      categories: ['strong category'],
      inventoryId: 'inventory-id',
      variants: [
        {
          barCode: '123',
          brand: 'vanilla',
          name: 'Product variant',
          pricePerUnit: 1000,
          unitType: ProductUnitType.UNIT,
          quantity: 10,
        },
      ],
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.product).toBeInstanceOf(Product)
      expect(productsInMemoryRepository.products).toHaveLength(1)
      expect(productVariantsInMemoryRepository.productVariants).toHaveLength(1)
      expect(
        productCategoriesInMemoryRepository.productCategories,
      ).toHaveLength(1)
      expect(inventoriesInMemoryRepository.inventories).toHaveLength(1)
      expect(
        productVariantInventoriesInMemoryRepository.productVariantInventories,
      ).toHaveLength(1)
      expect(
        productVariantsInMemoryRepository.productVariants[0].barCode,
      ).toEqual('123')
    }
  })
})
