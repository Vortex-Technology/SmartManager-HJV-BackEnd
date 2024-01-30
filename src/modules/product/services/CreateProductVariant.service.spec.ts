import { CreateProductVariantService } from './CreateProductVariant.service'
import { CollaboratorsInMemoryRepository } from '@test/repositories/modules/collaborator/CollaboratorsInMemoryRepository'
import { VerifyPermissionsOfCollaboratorInCompanyService } from '@modules/interceptors/services/VerifyPermissionsOfCollaboratorInCompany.service'
import { VerifyPermissionsOfCollaboratorInMarketService } from '@modules/interceptors/services/VerifyPermissionsOfCollaboratorInMarket.service'
import { CompaniesInMemoryRepository } from '@test/repositories/modules/company/CompaniesInMemoryRepository'
import { InventoriesInMemoryRepository } from '@test/repositories/modules/inventory/InventoriesInMemoryRepository'
import { ProductVariantInventoriesInMemoryRepository } from '@test/repositories/modules/inventory/ProductVariantInventoriesInMemoryRepository'
import { MarketsInMemoryRepository } from '@test/repositories/modules/market/MarketsInMemoryRepository'
import { OwnersInMemoryRepository } from '@test/repositories/modules/owner/OwnersInMemoryRepository'
import { FakeTransactor } from '@test/repositories/infra/transactor/fakeTransactor'
import { ProductsInMemoryRepository } from '@test/repositories/modules/product/ProductsInMemoryRepository'
import { ProductVariantsInMemoryRepository } from '@test/repositories/modules/product/ProductVariantsInMemoryRepository'
import { makeCompany } from '@test/factories/modules/company/makeCompany'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { makeMarket } from '@test/factories/modules/market/makeMarket'
import { makeManager } from '@test/factories/modules/manager/makeManager'
import { makeInventory } from '@test/factories/modules/inventory/makeInventory'
import { makeProduct } from '@test/factories/modules/product/makeProduct'
import { ProductUnitType } from '../entities/Product'
import { ProductVariant } from '../entities/ProductVariant'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { ProductNotFound } from '../errors/ProductNotFound'
import { ProductVariantAlreadyExistsWithSame } from '../errors/ProductVariantAlreadyExistsWithSame'
import { makeProductVariant } from '@test/factories/modules/product/makeProductVariant'
import { InventoryNotFount } from '@modules/inventory/errors/InventoryNotFound'

let ownersInMemoryRepository: OwnersInMemoryRepository
let productVariantInventoriesInMemoryRepository: ProductVariantInventoriesInMemoryRepository
let inventoriesInMemoryRepository: InventoriesInMemoryRepository
let marketsInMemoryRepository: MarketsInMemoryRepository
let companiesInMemoryRepository: CompaniesInMemoryRepository
let verifyPermissionsOfCollaboratorInCompanyService: VerifyPermissionsOfCollaboratorInCompanyService
let verifyPermissionsOfCollaboratorInMarketService: VerifyPermissionsOfCollaboratorInMarketService
let collaboratorsInMemoryRepository: CollaboratorsInMemoryRepository
let productsInMemoryRepository: ProductsInMemoryRepository

let productVariantsInMemoryRepository: ProductVariantsInMemoryRepository
let fakeTransactor: FakeTransactor

let sut: CreateProductVariantService

describe('CreateProductVariantService', async () => {
  beforeEach(async () => {
    collaboratorsInMemoryRepository = new CollaboratorsInMemoryRepository()

    productVariantInventoriesInMemoryRepository =
      new ProductVariantInventoriesInMemoryRepository()

    inventoriesInMemoryRepository = new InventoriesInMemoryRepository(
      productVariantInventoriesInMemoryRepository,
    )

    marketsInMemoryRepository = new MarketsInMemoryRepository(
      collaboratorsInMemoryRepository,
      inventoriesInMemoryRepository,
    )
    ownersInMemoryRepository = new OwnersInMemoryRepository(
      collaboratorsInMemoryRepository,
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

    productVariantsInMemoryRepository = new ProductVariantsInMemoryRepository()

    productsInMemoryRepository = new ProductsInMemoryRepository(
      productVariantsInMemoryRepository,
    )

    fakeTransactor = new FakeTransactor()

    sut = new CreateProductVariantService(
      fakeTransactor,
      verifyPermissionsOfCollaboratorInMarketService,
      productsInMemoryRepository,
      productVariantsInMemoryRepository,
      inventoriesInMemoryRepository,
    )
  })

  it('should be able to create product variant', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const inventory = makeInventory(
      { companyId: company.id },
      new UniqueEntityId('inventory-1'),
    )
    await inventoriesInMemoryRepository.create(inventory)

    const market = makeMarket(
      { companyId: company.id, inventoryId: inventory.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const manager = makeManager(
      { marketId: market.id },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(manager)

    const product = makeProduct({}, new UniqueEntityId('product-1'))
    await productsInMemoryRepository.create(product)

    const response = await sut.execute({
      collaboratorId: 'manager-1',
      productId: 'product-1',
      inventoryId: 'inventory-1',
      companyId: 'company-1',
      marketId: 'market-1',
      barCode: '123',
      brand: 'vanilla',
      name: 'Product variant',
      pricePerUnit: 1000,
      unitType: ProductUnitType.KILOS,
      quantity: 10,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.productVariant).toBeInstanceOf(ProductVariant)
      expect(productsInMemoryRepository.products[0].updatedAt).toBeInstanceOf(
        Date,
      )
      expect(productVariantsInMemoryRepository.productVariants).toHaveLength(1)
      expect(
        inventoriesInMemoryRepository.inventories[0].updatedAt,
      ).toBeInstanceOf(Date)

      expect(
        productVariantInventoriesInMemoryRepository.productVariantInventories,
      ).toHaveLength(1)

      expect(
        productVariantInventoriesInMemoryRepository.productVariantInventories[0]
          .quantity,
      ).toEqual(10)

      expect(
        productVariantsInMemoryRepository.productVariants[0].pricePerUnit,
      ).toEqual(1000)
    }
  })

  it("not should be able to create product variant if collaborator doesn't exist", async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const inventory = makeInventory(
      { companyId: company.id },
      new UniqueEntityId('inventory-1'),
    )
    await inventoriesInMemoryRepository.create(inventory)

    const market = makeMarket(
      { companyId: company.id, inventoryId: inventory.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const manager = makeManager(
      { marketId: market.id },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(manager)

    const product = makeProduct({}, new UniqueEntityId('product-1'))
    await productsInMemoryRepository.create(product)

    const response = await sut.execute({
      collaboratorId: 'inexistent-manager',
      productId: 'product-1',
      inventoryId: 'inventory-1',
      companyId: 'company-1',
      marketId: 'market-1',
      barCode: '123',
      brand: 'vanilla',
      name: 'Product variant',
      pricePerUnit: 1000,
      unitType: ProductUnitType.KILOS,
      quantity: 10,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CollaboratorNotFound)
  })

  it("not should be able to create product variant if collaborator doesn't belong company ", async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const inventory = makeInventory(
      { companyId: company.id },
      new UniqueEntityId('inventory-1'),
    )
    await inventoriesInMemoryRepository.create(inventory)

    const market = makeMarket(
      { companyId: company.id, inventoryId: inventory.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const market2 = makeMarket({}, new UniqueEntityId('market-2'))
    marketsInMemoryRepository.markets.push(market2)

    const manager = makeManager(
      { marketId: market.id },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(manager)

    const product = makeProduct({}, new UniqueEntityId('product-1'))
    await productsInMemoryRepository.create(product)

    const response = await sut.execute({
      collaboratorId: 'manager-1',
      productId: 'product-1',
      inventoryId: 'inventory-1',
      companyId: 'company-1',
      marketId: 'market-2',
      barCode: '123',
      brand: 'vanilla',
      name: 'Product variant',
      pricePerUnit: 1000,
      unitType: ProductUnitType.KILOS,
      quantity: 10,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it("not should be able to create product variant if company doesn't exist ", async () => {
    const inventory = makeInventory({}, new UniqueEntityId('inventory-1'))
    await inventoriesInMemoryRepository.create(inventory)

    const market = makeMarket(
      { inventoryId: inventory.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const manager = makeManager(
      { marketId: market.id },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(manager)

    const product = makeProduct({}, new UniqueEntityId('product-1'))
    await productsInMemoryRepository.create(product)

    const response = await sut.execute({
      collaboratorId: 'manager-1',
      productId: 'product-1',
      inventoryId: 'inventory-1',
      companyId: 'company-1',
      marketId: 'market-2',
      barCode: '123',
      brand: 'vanilla',
      name: 'Product variant',
      pricePerUnit: 1000,
      unitType: ProductUnitType.KILOS,
      quantity: 10,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CompanyNotFound)
  })

  it("not should be able to create product variant if collaborator doesn't belong company ", async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const inventory = makeInventory(
      { companyId: company.id },
      new UniqueEntityId('inventory-1'),
    )
    await inventoriesInMemoryRepository.create(inventory)

    const market = makeMarket(
      { companyId: company.id, inventoryId: inventory.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const market2 = makeMarket({}, new UniqueEntityId('market-2'))
    marketsInMemoryRepository.markets.push(market2)

    const manager = makeManager(
      { marketId: market.id },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(manager)

    const product = makeProduct({}, new UniqueEntityId('product-1'))
    await productsInMemoryRepository.create(product)

    const response = await sut.execute({
      collaboratorId: 'manager-1',
      productId: 'product-1',
      inventoryId: 'inventory-1',
      companyId: 'company-1',
      marketId: 'market-2',
      barCode: '123',
      brand: 'vanilla',
      name: 'Product variant',
      pricePerUnit: 1000,
      unitType: ProductUnitType.KILOS,
      quantity: 10,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it('not should be able to create product variant if product not found', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const inventory = makeInventory(
      { companyId: company.id },
      new UniqueEntityId('inventory-1'),
    )
    await inventoriesInMemoryRepository.create(inventory)

    const market = makeMarket(
      { companyId: company.id, inventoryId: inventory.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const manager = makeManager(
      { marketId: market.id },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(manager)

    const response = await sut.execute({
      collaboratorId: 'manager-1',
      productId: 'inexistent-product',
      inventoryId: 'inventory-1',
      companyId: 'company-1',
      marketId: 'market-1',
      barCode: '123',
      brand: 'vanilla',
      name: 'Product variant',
      pricePerUnit: 1000,
      unitType: ProductUnitType.KILOS,
      quantity: 10,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ProductNotFound)
  })

  it('not should be able to create product variant if already exist one with same barcode', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const inventory = makeInventory(
      { companyId: company.id },
      new UniqueEntityId('inventory-1'),
    )
    await inventoriesInMemoryRepository.create(inventory)

    const market = makeMarket(
      { companyId: company.id, inventoryId: inventory.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const manager = makeManager(
      { marketId: market.id },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(manager)

    const product = makeProduct({}, new UniqueEntityId('product-1'))
    await productsInMemoryRepository.create(product)

    const productVariant = makeProductVariant(
      { barCode: '123' },
      new UniqueEntityId('product-1'),
    )
    await productVariantsInMemoryRepository.create(productVariant)

    const response = await sut.execute({
      collaboratorId: 'manager-1',
      productId: 'product-1',
      inventoryId: 'inventory-1',
      companyId: 'company-1',
      marketId: 'market-1',
      barCode: '123',
      brand: 'vanilla',
      name: 'Product variant',
      pricePerUnit: 1000,
      unitType: ProductUnitType.KILOS,
      quantity: 10,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ProductVariantAlreadyExistsWithSame)
  })

  it('not should be able to create product variant if inventory not found', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const market = makeMarket(
      { companyId: company.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const manager = makeManager(
      { marketId: market.id },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(manager)

    const product = makeProduct({}, new UniqueEntityId('product-1'))
    await productsInMemoryRepository.create(product)

    const response = await sut.execute({
      collaboratorId: 'manager-1',
      productId: 'product-1',
      inventoryId: 'inexistent-inventory',
      companyId: 'company-1',
      marketId: 'market-1',
      barCode: '123',
      brand: 'vanilla',
      name: 'Product variant',
      pricePerUnit: 1000,
      unitType: ProductUnitType.KILOS,
      quantity: 10,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(InventoryNotFount)
  })
})
