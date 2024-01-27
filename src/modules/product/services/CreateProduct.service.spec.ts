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
import { FakeTransactor } from '@test/repositories/infra/transactor/fakeTransactor'
import { VerifyPermissionsOfCollaboratorInMarketService } from '@modules/interceptors/services/VerifyPermissionsOfCollaboratorInMarket.service'
import { VerifyPermissionsOfCollaboratorInCompanyService } from '@modules/interceptors/services/VerifyPermissionsOfCollaboratorInCompany.service'
import { CompaniesInMemoryRepository } from '@test/repositories/modules/company/CompaniesInMemoryRepository'
import { MarketsInMemoryRepository } from '@test/repositories/modules/market/MarketsInMemoryRepository'
import { OwnersInMemoryRepository } from '@test/repositories/modules/owner/OwnersInMemoryRepository'
import { makeCompany } from '@test/factories/modules/company/makeCompany'
import { makeMarket } from '@test/factories/modules/market/makeMarket'

let ownersInMemoryRepository: OwnersInMemoryRepository
let marketsInMemoryRepository: MarketsInMemoryRepository
let companiesInMemoryRepository: CompaniesInMemoryRepository
let verifyPermissionsOfCollaboratorInCompanyService: VerifyPermissionsOfCollaboratorInCompanyService
let verifyPermissionsOfCollaboratorInMarketService: VerifyPermissionsOfCollaboratorInMarketService
let collaboratorsInMemoryRepository: CollaboratorsInMemoryRepository
let productCategoriesInMemoryRepository: ProductCategoriesInMemoryRepository
let productsInMemoryRepository: ProductsInMemoryRepository
let productVariantsInMemoryRepository: ProductVariantsInMemoryRepository
let inventoriesInMemoryRepository: InventoriesInMemoryRepository
let productVariantInventoriesInMemoryRepository: ProductVariantInventoriesInMemoryRepository
let fakeTransactor: FakeTransactor

let sut: CreateProductService

describe('Create product', () => {
  beforeEach(() => {
    fakeTransactor = new FakeTransactor()

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

    ownersInMemoryRepository = new OwnersInMemoryRepository(
      collaboratorsInMemoryRepository,
    )

    marketsInMemoryRepository = new MarketsInMemoryRepository(
      collaboratorsInMemoryRepository,
      inventoriesInMemoryRepository,
    )

    companiesInMemoryRepository = new CompaniesInMemoryRepository(
      marketsInMemoryRepository,
      ownersInMemoryRepository,
    )

    verifyPermissionsOfCollaboratorInCompanyService =
      new VerifyPermissionsOfCollaboratorInCompanyService(
        collaboratorsInMemoryRepository,
        companiesInMemoryRepository,
      )

    verifyPermissionsOfCollaboratorInMarketService =
      new VerifyPermissionsOfCollaboratorInMarketService(
        verifyPermissionsOfCollaboratorInCompanyService,
        marketsInMemoryRepository,
      )

    sut = new CreateProductService(
      productCategoriesInMemoryRepository,
      productsInMemoryRepository,
      productVariantsInMemoryRepository,
      inventoriesInMemoryRepository,
      fakeTransactor,
      verifyPermissionsOfCollaboratorInMarketService,
    )
  })

  it('should be able to create a new product', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const collaborator = makeManager(
      { marketId: new UniqueEntityId('market-1') },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(collaborator)

    const market = makeMarket(
      { companyId: company.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const inventory = makeInventory({}, new UniqueEntityId('inventory-1'))
    await inventoriesInMemoryRepository.create(inventory)

    const response = await sut.execute({
      creatorId: 'manager-1',
      name: 'Product category',
      categories: ['strong category'],
      inventoryId: 'inventory-1',
      companyId: 'company-1',
      marketId: 'market-1',
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
    const inventory = makeInventory({}, new UniqueEntityId('inventory-1'))
    await inventoriesInMemoryRepository.create(inventory)

    const response = await sut.execute({
      creatorId: 'inexistent-manager-id',
      inventoryId: 'inventory-1',
      name: 'Product category',
      categories: ['strong category'],
      companyId: 'company-1',
      marketId: 'market-1',
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

    const inventory = makeInventory({}, new UniqueEntityId('inventory-1'))
    await inventoriesInMemoryRepository.create(inventory)

    const response = await sut.execute({
      creatorId: 'seller-1',
      name: 'Product category',
      categories: ['strong category'],
      inventoryId: 'inventory-1',
      companyId: 'company-1',
      marketId: 'market-1',
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
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const collaborator = makeManager(
      { marketId: new UniqueEntityId('market-1') },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(collaborator)

    const market = makeMarket(
      { companyId: company.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const inventory = makeInventory({}, new UniqueEntityId('inventory-1'))
    await inventoriesInMemoryRepository.create(inventory)

    const response = await sut.execute({
      creatorId: 'manager-1',
      name: 'Product category',
      inventoryId: 'inventory-1',
      categories: ['strong category', 'strong category 2'],
      companyId: 'company-1',
      marketId: 'market-1',
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
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const collaborator = makeManager(
      { marketId: new UniqueEntityId('market-1') },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(collaborator)

    const market = makeMarket(
      { companyId: company.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const productCategory = makeProductCategory({
      name: 'strong category',
    })
    await productCategoriesInMemoryRepository.create(productCategory)

    const inventory = makeInventory({}, new UniqueEntityId('inventory-1'))
    await inventoriesInMemoryRepository.create(inventory)

    const response = await sut.execute({
      creatorId: 'manager-1',
      name: 'Product category',
      inventoryId: 'inventory-1',
      categories: ['strong category', 'strong category 2'],
      companyId: 'company-1',
      marketId: 'market-1',
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
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const collaborator = makeManager(
      { marketId: new UniqueEntityId('market-1') },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(collaborator)

    const market = makeMarket(
      { companyId: company.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const productCategory = makeProductCategory({
      name: 'strong category',
    })
    const productCategory2 = makeProductCategory({
      name: 'strong category 2',
    })
    const productCategory3 = makeProductCategory({
      name: 'strong category 3',
    })
    const inventory = makeInventory({}, new UniqueEntityId('inventory-1'))

    await inventoriesInMemoryRepository.create(inventory)
    await collaboratorsInMemoryRepository.create(collaborator)
    await productCategoriesInMemoryRepository.create(productCategory)
    await productCategoriesInMemoryRepository.create(productCategory2)
    await productCategoriesInMemoryRepository.create(productCategory3)

    const response = await sut.execute({
      creatorId: 'manager-1',
      name: 'Product category',
      inventoryId: 'inventory-1',
      categories: ['strong category', 'strong category 2', 'strong category 3'],
      companyId: 'company-1',
      marketId: 'market-1',
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
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const collaborator = makeManager(
      { marketId: new UniqueEntityId('market-1') },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(collaborator)

    const market = makeMarket(
      { companyId: company.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const productVariant = makeProductVariant({
      name: 'pão',
      barCode: '123',
    })
    await productVariantsInMemoryRepository.create(productVariant)

    const inventory = makeInventory({}, new UniqueEntityId('inventory-1'))
    await inventoriesInMemoryRepository.create(inventory)

    const response = await sut.execute({
      creatorId: 'manager-1',
      name: 'Product category',
      inventoryId: 'inventory-1',
      categories: ['strong category'],
      companyId: 'company-1',
      marketId: 'market-1',
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
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const collaborator = makeManager(
      { marketId: new UniqueEntityId('market-1') },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(collaborator)

    const market = makeMarket(
      { companyId: company.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const productVariant = makeProductVariant({
      name: 'pão',
      barCode: '123',
    })

    const productVariant2 = makeProductVariant({
      name: 'pão',
      barCode: '131315',
    })

    const inventory = makeInventory({}, new UniqueEntityId('inventory-1'))

    await inventoriesInMemoryRepository.create(inventory)
    await collaboratorsInMemoryRepository.create(collaborator)
    await productVariantsInMemoryRepository.create(productVariant)
    await productVariantsInMemoryRepository.create(productVariant2)

    const response = await sut.execute({
      creatorId: 'manager-1',
      name: 'Product category',
      categories: ['strong category'],
      inventoryId: 'inventory-1',
      companyId: 'company-1',
      marketId: 'market-1',
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
})
