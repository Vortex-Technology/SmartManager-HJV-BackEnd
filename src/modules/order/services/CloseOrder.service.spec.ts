import { VerifyPermissionsOfCollaboratorInCompanyService } from '@modules/interceptors/services/VerifyPermissionsOfCollaboratorInCompany.service'
import { VerifyPermissionsOfCollaboratorInMarketService } from '@modules/interceptors/services/VerifyPermissionsOfCollaboratorInMarket.service'
import { CollaboratorsInMemoryRepository } from '@test/repositories/modules/collaborator/CollaboratorsInMemoryRepository'
import { CompaniesInMemoryRepository } from '@test/repositories/modules/company/CompaniesInMemoryRepository'
import { InventoriesInMemoryRepository } from '@test/repositories/modules/inventory/InventoriesInMemoryRepository'
import { ProductVariantInventoriesInMemoryRepository } from '@test/repositories/modules/inventory/ProductVariantInventoriesInMemoryRepository'
import { MarketsInMemoryRepository } from '@test/repositories/modules/market/MarketsInMemoryRepository'
import { OwnersInMemoryRepository } from '@test/repositories/modules/owner/OwnersInMemoryRepository'
import { CloseOrderService } from './CloseOrder.service'
import { OrdersInMemoryRepository } from '@test/repositories/modules/order/OrdersInMemoryRepository'
import { makeCompany } from '@test/factories/modules/company/makeCompany'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { makeMarket } from '@test/factories/modules/market/makeMarket'
import { makeManager } from '@test/factories/modules/manager/makeManager'
import { ProductVariantsInMemoryRepository } from '@test/repositories/modules/product/ProductVariantsInMemoryRepository'
import { makeOrder } from '@test/factories/modules/order/makeOrder'

let ownersInMemoryRepository: OwnersInMemoryRepository
let marketsInMemoryRepository: MarketsInMemoryRepository
let companiesInMemoryRepository: CompaniesInMemoryRepository
let ordersInMemoryRepository: OrdersInMemoryRepository
let verifyPermissionsOfCollaboratorInCompanyService: VerifyPermissionsOfCollaboratorInCompanyService
let verifyPermissionsOfCollaboratorInMarketService: VerifyPermissionsOfCollaboratorInMarketService
let collaboratorsInMemoryRepository: CollaboratorsInMemoryRepository
let inventoriesInMemoryRepository: InventoriesInMemoryRepository
let productVariantInventoriesInMemoryRepository: ProductVariantInventoriesInMemoryRepository
let productVariantsInMemoryRepository: ProductVariantsInMemoryRepository

let sut: CloseOrderService

describe('Close order service', async () => {
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

    sut = new CloseOrderService(
      verifyPermissionsOfCollaboratorInMarketService,
      ordersInMemoryRepository,
      productVariantsInMemoryRepository,
    )
  })

  it('should be able to close order service', async () => {
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

    const order = makeOrder({
      marketId: market.id,
      openedById: manager.id,
      companyId: company.id,
    })

    const response = await sut.execute({
      collaboratorId: 'manager-1',
      companyId: 'company-1',
      marketId: 'market-1',
    })

    expect(response.isRight()).toBe(true)
  })
})
