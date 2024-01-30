import { VerifyPermissionsOfCollaboratorInCompanyService } from '@modules/interceptors/services/VerifyPermissionsOfCollaboratorInCompany.service'
import { VerifyPermissionsOfCollaboratorInMarketService } from '@modules/interceptors/services/VerifyPermissionsOfCollaboratorInMarket.service'
import { CollaboratorsInMemoryRepository } from '@test/repositories/modules/collaborator/CollaboratorsInMemoryRepository'
import { CompaniesInMemoryRepository } from '@test/repositories/modules/company/CompaniesInMemoryRepository'
import { InventoriesInMemoryRepository } from '@test/repositories/modules/inventory/InventoriesInMemoryRepository'
import { ProductVariantInventoriesInMemoryRepository } from '@test/repositories/modules/inventory/ProductVariantInventoriesInMemoryRepository'
import { MarketsInMemoryRepository } from '@test/repositories/modules/market/MarketsInMemoryRepository'
import { OrdersInMemoryRepository } from '@test/repositories/modules/order/OrdersInMemoryRepository'
import { OwnersInMemoryRepository } from '@test/repositories/modules/owner/OwnersInMemoryRepository'
import { AddProductOnOrderService } from './AddProductOnOrder.service'
import { ProductVariantsInMemoryRepository } from '@test/repositories/modules/product/ProductVariantsInMemoryRepository'
import { FakeTransactor } from '@test/repositories/infra/transactor/fakeTransactor'
import { makeCompany } from '@test/factories/modules/company/makeCompany'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { makeMarket } from '@test/factories/modules/market/makeMarket'
import { makeManager } from '@test/factories/modules/manager/makeManager'
import { makeOrder } from '@test/factories/modules/order/makeOrder'
import { makeProductVariant } from '@test/factories/modules/product/makeProductVariant'
import { makeProductVariantInventory } from '@test/factories/modules/inventory/makeProductVariantInventory'
import { makeInventory } from '@test/factories/modules/inventory/makeInventory'
import { OrderProductVariant } from '../entities/OrderProductVariant'
import { OrderNotFound } from '../errors/OrderNotFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { ProductVariantInventoryNotFound } from '@modules/inventory/errors/ProductVariantInventoryNotFound'
import { NotEnoughItems } from '@modules/inventory/errors/NotEnoughItems'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { MarketNotFound } from '@modules/market/errors/MarketNorFound'

let fakeTransactor: FakeTransactor
let productVariantsInMemoryRepository: ProductVariantsInMemoryRepository
let ownersInMemoryRepository: OwnersInMemoryRepository
let marketsInMemoryRepository: MarketsInMemoryRepository
let companiesInMemoryRepository: CompaniesInMemoryRepository
let ordersInMemoryRepository: OrdersInMemoryRepository
let verifyPermissionsOfCollaboratorInCompanyService: VerifyPermissionsOfCollaboratorInCompanyService
let verifyPermissionsOfCollaboratorInMarketService: VerifyPermissionsOfCollaboratorInMarketService
let collaboratorsInMemoryRepository: CollaboratorsInMemoryRepository
let inventoriesInMemoryRepository: InventoriesInMemoryRepository
let productVariantInventoriesInMemoryRepository: ProductVariantInventoriesInMemoryRepository

let sut: AddProductOnOrderService

describe('Add product on order service', async () => {
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

    ordersInMemoryRepository = new OrdersInMemoryRepository()

    productVariantsInMemoryRepository = new ProductVariantsInMemoryRepository()

    fakeTransactor = new FakeTransactor()

    sut = new AddProductOnOrderService(
      verifyPermissionsOfCollaboratorInMarketService,
      ordersInMemoryRepository,
      productVariantsInMemoryRepository,
      productVariantInventoriesInMemoryRepository,
      fakeTransactor,
    )
  })

  it('should be able to add product order ', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const productVariant = makeProductVariant(
      { barCode: '123456789012345678901234567890123456789012345678' },
      new UniqueEntityId('productVariant-1'),
    )
    productVariantsInMemoryRepository.create(productVariant)

    const inventory = makeInventory(
      { companyId: company.id },
      new UniqueEntityId('inventory-1'),
    )
    inventoriesInMemoryRepository.create(inventory)

    const productVariantInventory = makeProductVariantInventory({
      productVariantId: productVariant.id,
      inventoryId: inventory.id,
      quantity: 1,
    })

    productVariantInventoriesInMemoryRepository.productVariantInventories.push(
      productVariantInventory,
    )

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

    const order = makeOrder(
      { companyId: company.id, marketId: market.id },
      new UniqueEntityId('order-1'),
    )
    await ordersInMemoryRepository.create(order)

    const response = await sut.execute({
      collaboratorId: 'manager-1',
      companyId: 'company-1',
      marketId: 'market-1',
      orderId: 'order-1',
      barcode: '123456789012345678901234567890123456789012345678',
      quantity: 10,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.orderProductVariant).toBeInstanceOf(
        OrderProductVariant,
      )
      expect(productVariantsInMemoryRepository.productVariants).toHaveLength(1)
      expect(inventoriesInMemoryRepository.inventories).toHaveLength(1)
      expect(
        productVariantInventoriesInMemoryRepository.productVariantInventories,
      ).toHaveLength(1)
    }
  })

  it('not should be able to add product order if order not found', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const productVariant = makeProductVariant(
      { barCode: '123456789012345678901234567890123456789012345678' },
      new UniqueEntityId('productVariant-1'),
    )
    productVariantsInMemoryRepository.create(productVariant)

    const inventory = makeInventory(
      { companyId: company.id },
      new UniqueEntityId('inventory-1'),
    )
    inventoriesInMemoryRepository.create(inventory)

    const productVariantInventory = makeProductVariantInventory({
      productVariantId: productVariant.id,
      inventoryId: inventory.id,
    })

    productVariantInventoriesInMemoryRepository.productVariantInventories.push(
      productVariantInventory,
    )

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
      companyId: 'company-1',
      marketId: 'market-1',
      orderId: 'inexistent-order',
      barcode: '123456789012345678901234567890123456789012345678',
      quantity: 10,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(OrderNotFound)
  })

  it("not should be able to add product order if doesn't exist companyId ", async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const company2 = makeCompany({}, new UniqueEntityId('company-2'))
    await companiesInMemoryRepository.create(company2)

    const productVariant = makeProductVariant(
      { barCode: '123456789012345678901234567890123456789012345678' },
      new UniqueEntityId('productVariant-1'),
    )
    productVariantsInMemoryRepository.create(productVariant)

    const inventory = makeInventory({}, new UniqueEntityId('inventory-1'))
    inventoriesInMemoryRepository.create(inventory)

    const productVariantInventory = makeProductVariantInventory({
      productVariantId: productVariant.id,
      inventoryId: inventory.id,
    })

    productVariantInventoriesInMemoryRepository.productVariantInventories.push(
      productVariantInventory,
    )

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

    const order = makeOrder(
      { marketId: market.id, companyId: company.id },
      new UniqueEntityId('order-1'),
    )
    await ordersInMemoryRepository.create(order)

    const response = await sut.execute({
      collaboratorId: 'manager-1',
      companyId: 'company-2',
      marketId: 'market-1',
      orderId: 'order-1',
      barcode: '123456789012345678901234567890123456789012345678',
      quantity: 10,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it("not should be able to add product order if doesn't exist marketId ", async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const productVariant = makeProductVariant(
      { barCode: '123456789012345678901234567890123456789012345678' },
      new UniqueEntityId('productVariant-1'),
    )
    productVariantsInMemoryRepository.create(productVariant)

    const inventory = makeInventory({}, new UniqueEntityId('inventory-1'))
    inventoriesInMemoryRepository.create(inventory)

    const productVariantInventory = makeProductVariantInventory({
      productVariantId: productVariant.id,
      inventoryId: inventory.id,
    })

    productVariantInventoriesInMemoryRepository.productVariantInventories.push(
      productVariantInventory,
    )

    const market = makeMarket(
      { inventoryId: inventory.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const market2 = makeMarket(
      { inventoryId: inventory.id },
      new UniqueEntityId('market-2'),
    )
    marketsInMemoryRepository.markets.push(market2)

    const manager = makeManager(
      { marketId: market.id },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(manager)

    const order = makeOrder(
      { marketId: market.id, companyId: company.id },
      new UniqueEntityId('order-1'),
    )
    await ordersInMemoryRepository.create(order)

    const response = await sut.execute({
      collaboratorId: 'manager-1',
      companyId: 'company-1',
      marketId: 'market-2',
      orderId: 'order-1',
      barcode: '123456789012345678901234567890123456789012345678',
      quantity: 10,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it('not should be able to add product order if product variant inventory not found ', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const productVariant = makeProductVariant(
      { barCode: '123456789012345678901234567890123456789012345678' },
      new UniqueEntityId('productVariant-1'),
    )
    productVariantsInMemoryRepository.create(productVariant)

    const inventory = makeInventory(
      { companyId: company.id },
      new UniqueEntityId('inventory-1'),
    )
    inventoriesInMemoryRepository.create(inventory)

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

    const order = makeOrder(
      { companyId: company.id, marketId: market.id },
      new UniqueEntityId('order-1'),
    )
    await ordersInMemoryRepository.create(order)

    const response = await sut.execute({
      collaboratorId: 'manager-1',
      companyId: 'company-1',
      marketId: 'market-1',
      orderId: 'order-1',
      barcode: '123456789012345678901234567890123456789012345678',
      quantity: 10,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ProductVariantInventoryNotFound)
  })

  it('not should be able to add product order if product variant inventory not enough items', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const productVariant = makeProductVariant(
      { barCode: '123456789012345678901234567890123456789012345678' },
      new UniqueEntityId('productVariant-1'),
    )
    productVariantsInMemoryRepository.create(productVariant)

    const inventory = makeInventory(
      { companyId: company.id },
      new UniqueEntityId('inventory-1'),
    )
    inventoriesInMemoryRepository.create(inventory)

    const productVariantInventory = makeProductVariantInventory({
      productVariantId: productVariant.id,
      inventoryId: inventory.id,
      quantity: 3,
    })

    productVariantInventoriesInMemoryRepository.productVariantInventories.push(
      productVariantInventory,
    )

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

    const order = makeOrder(
      { companyId: company.id, marketId: market.id },
      new UniqueEntityId('order-1'),
    )
    await ordersInMemoryRepository.create(order)

    const response = await sut.execute({
      collaboratorId: 'manager-1',
      companyId: 'company-1',
      marketId: 'market-1',
      orderId: 'order-1',
      barcode: '123456789012345678901234567890123456789012345678',
      quantity: 2,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(NotEnoughItems)
  })

  it('not should be able to add product order if collaborator not found', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const productVariant = makeProductVariant(
      { barCode: '123456789012345678901234567890123456789012345678' },
      new UniqueEntityId('productVariant-1'),
    )
    productVariantsInMemoryRepository.create(productVariant)

    const inventory = makeInventory(
      { companyId: company.id },
      new UniqueEntityId('inventory-1'),
    )
    inventoriesInMemoryRepository.create(inventory)

    const productVariantInventory = makeProductVariantInventory({
      productVariantId: productVariant.id,
      inventoryId: inventory.id,
      quantity: 1,
    })

    productVariantInventoriesInMemoryRepository.productVariantInventories.push(
      productVariantInventory,
    )

    const market = makeMarket(
      { companyId: company.id, inventoryId: inventory.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const order = makeOrder(
      { companyId: company.id, marketId: market.id },
      new UniqueEntityId('order-1'),
    )
    await ordersInMemoryRepository.create(order)

    const response = await sut.execute({
      collaboratorId: 'inexistent-manager',
      companyId: 'company-1',
      marketId: 'market-1',
      orderId: 'order-1',
      barcode: '123456789012345678901234567890123456789012345678',
      quantity: 10,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CollaboratorNotFound)
  })

  it('not should be able to add product order if product variant market not found ', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const productVariant = makeProductVariant(
      { barCode: '123456789012345678901234567890123456789012345678' },
      new UniqueEntityId('productVariant-1'),
    )
    productVariantsInMemoryRepository.create(productVariant)

    const inventory = makeInventory(
      { companyId: company.id },
      new UniqueEntityId('inventory-1'),
    )
    inventoriesInMemoryRepository.create(inventory)

    const productVariantInventory = makeProductVariantInventory({
      productVariantId: productVariant.id,
      inventoryId: inventory.id,
      quantity: 1,
    })

    productVariantInventoriesInMemoryRepository.productVariantInventories.push(
      productVariantInventory,
    )

    const manager = makeManager({}, new UniqueEntityId('manager-1'))
    await collaboratorsInMemoryRepository.create(manager)

    const order = makeOrder(
      { companyId: company.id },
      new UniqueEntityId('order-1'),
    )
    await ordersInMemoryRepository.create(order)

    const response = await sut.execute({
      collaboratorId: 'manager-1',
      companyId: 'company-1',
      marketId: 'inexistent-market',
      orderId: 'order-1',
      barcode: '123456789012345678901234567890123456789012345678',
      quantity: 10,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(MarketNotFound)
  })
})
