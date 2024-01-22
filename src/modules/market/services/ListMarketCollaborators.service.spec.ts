import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { ListMarketCollaboratorsService } from './ListMarketCollaborators.service'
import { MarketsInMemoryRepository } from '@test/repositories/modules/market/MarketsInMemoryRepository'
import { CollaboratorsInMemoryRepository } from '@test/repositories/modules/collaborator/CollaboratorsInMemoryRepository'
import { InventoriesInMemoryRepository } from '@test/repositories/modules/inventory/InventoriesInMemoryRepository'
import { ProductVariantInventoriesInMemoryRepository } from '@test/repositories/modules/inventory/ProductVariantInventoriesInMemoryRepository'
import { makeMarket } from '@test/factories/modules/market/makeMarket'
import { makeManager } from '@test/factories/modules/manager/makeManager'
import { Collaborator } from '@modules/collaborator/entities/Collaborator'
import { MarketNotFound } from '../errors/MarketNorFound'
import { makeSeller } from '@test/factories/modules/seller/makeSeller'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { CompaniesInMemoryRepository } from '@test/repositories/modules/company/CompaniesInMemoryRepository'
import { makeCompany } from '@test/factories/modules/company/makeCompany'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { makeOwner } from '@test/factories/modules/owner/makeOwner'

let companiesInMemoryRepository: CompaniesInMemoryRepository
let marketsInMemoryRepository: MarketsInMemoryRepository
let productVariantInventoriesInMemoryRepository: ProductVariantInventoriesInMemoryRepository
let inventoriesInMemoryRepository: InventoriesInMemoryRepository
let collaboratorsInMemoryRepository: CollaboratorsInMemoryRepository

let sut: ListMarketCollaboratorsService

describe('List market collaborators', () => {
  beforeEach(() => {
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
    )

    sut = new ListMarketCollaboratorsService(
      marketsInMemoryRepository,
      companiesInMemoryRepository,
      collaboratorsInMemoryRepository,
    )
  })

  it('should be able to list market collaborators', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const market = makeMarket(
      {
        companyId: company.id,
      },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const collaborator = makeManager(
      { marketId: market.id },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(collaborator)

    for (let i = 0; i < 10; i++) {
      const collaborator = makeManager({ marketId: market.id })
      await collaboratorsInMemoryRepository.create(collaborator)
    }

    const response = await sut.execute({
      marketId: 'market-1',
      limit: 30,
      page: 1,
      collaboratorId: 'manager-1',
      companyId: 'company-1',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.collaborators[0]).toBeInstanceOf(Collaborator)
      expect(response.value.collaborators).toHaveLength(11)
      expect(response.value.size).toBe(11)
      expect(response.value.page).toBe(1)
    }
  })

  it('should be able to list market collaborators with pagination', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const market = makeMarket(
      {
        companyId: company.id,
      },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const collaborator = makeManager(
      { marketId: market.id },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(collaborator)

    for (let i = 0; i < 10; i++) {
      const collaborator = makeManager({ marketId: market.id })
      await collaboratorsInMemoryRepository.create(collaborator)
    }

    const response = await sut.execute({
      marketId: 'market-1',
      page: 2,
      limit: 10,
      collaboratorId: 'manager-1',
      companyId: 'company-1',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.collaborators[0]).toBeInstanceOf(Collaborator)
      expect(response.value.collaborators).toHaveLength(1)
      expect(response.value.size).toBe(11)
      expect(response.value.page).toBe(2)
    }
  })

  it('not should be able to create list market collaborators if market not exists', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const collaborator = makeManager({}, new UniqueEntityId('manager-1'))
    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      marketId: 'inexistent-market-id',
      page: 1,
      limit: 30,
      collaboratorId: 'manager-1',
      companyId: 'company-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(MarketNotFound)
  })

  it('not should be able to list market collaborators if requester not exist', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const market = makeMarket(
      {
        companyId: company.id,
      },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    for (let i = 0; i < 10; i++) {
      const collaborator = makeManager({ marketId: market.id })
      await collaboratorsInMemoryRepository.create(collaborator)
    }

    const response = await sut.execute({
      marketId: 'market-1',
      limit: 30,
      page: 1,
      collaboratorId: 'inexistent-collaborator-id',
      companyId: 'company-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CollaboratorNotFound)
  })

  it('not should be able to list market collaborators if requester does not have permission', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const market = makeMarket(
      {
        companyId: company.id,
      },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const collaborator = makeSeller(
      { marketId: market.id },
      new UniqueEntityId('seller-1'),
    )
    await collaboratorsInMemoryRepository.create(collaborator)

    for (let i = 0; i < 10; i++) {
      const collaborator = makeManager({ marketId: market.id })
      await collaboratorsInMemoryRepository.create(collaborator)
    }

    const response = await sut.execute({
      marketId: 'market-1',
      limit: 30,
      page: 1,
      collaboratorId: 'seller-1',
      companyId: 'company-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it('not should be able to list market collaborators of other markets', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const market = makeMarket(
      {
        companyId: company.id,
      },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const market2 = makeMarket({}, new UniqueEntityId('market-2'))
    marketsInMemoryRepository.markets.push(market)

    const collaborator = makeManager(
      { marketId: market.id },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(collaborator)

    for (let i = 0; i < 10; i++) {
      const collaborator = makeManager({ marketId: market.id })
      await collaboratorsInMemoryRepository.create(collaborator)
    }

    for (let i = 0; i < 70; i++) {
      const collaborator = makeManager({ marketId: market2.id })
      await collaboratorsInMemoryRepository.create(collaborator)
    }

    const response = await sut.execute({
      marketId: 'market-1',
      limit: 30,
      page: 1,
      collaboratorId: 'manager-1',
      companyId: 'company-1',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.collaborators[0]).toBeInstanceOf(Collaborator)
      expect(response.value.collaborators).toHaveLength(11)
      expect(response.value.size).toBe(11)
      expect(response.value.page).toBe(1)
    }
  })

  it('not should be able to list market collaborators if requester does not in list of collaborators of market', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const market = makeMarket(
      {
        companyId: company.id,
      },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const collaborator = makeManager(
      { marketId: new UniqueEntityId('other-market') },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(collaborator)

    for (let i = 0; i < 10; i++) {
      const collaborator = makeManager({ marketId: market.id })
      await collaboratorsInMemoryRepository.create(collaborator)
    }

    const response = await sut.execute({
      marketId: 'market-1',
      limit: 30,
      page: 1,
      collaboratorId: 'manager-1',
      companyId: 'company-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it('not should be able to list market collaborators if company not exists', async () => {
    const market = makeMarket({}, new UniqueEntityId('market-1'))
    marketsInMemoryRepository.markets.push(market)

    const collaborator = makeManager(
      { marketId: new UniqueEntityId('other-market') },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(collaborator)

    for (let i = 0; i < 10; i++) {
      const collaborator = makeManager({ marketId: market.id })
      await collaboratorsInMemoryRepository.create(collaborator)
    }

    const response = await sut.execute({
      marketId: 'market-1',
      limit: 30,
      page: 1,
      collaboratorId: 'manager-1',
      companyId: 'inexistent-company-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CompanyNotFound)
  })

  it('should be able to list market collaborators if requester is owner', async () => {
    const company = makeCompany(
      {
        ownerId: new UniqueEntityId('owner-1'),
      },
      new UniqueEntityId('company-1'),
    )
    await companiesInMemoryRepository.create(company)

    const market = makeMarket(
      {
        companyId: company.id,
      },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const owner = makeOwner(
      { companyId: company.id },
      new UniqueEntityId('owner-1'),
    )
    await collaboratorsInMemoryRepository.create(owner)

    for (let i = 0; i < 10; i++) {
      const collaborator = makeManager({ marketId: market.id })
      await collaboratorsInMemoryRepository.create(collaborator)
    }

    const response = await sut.execute({
      marketId: 'market-1',
      limit: 30,
      page: 1,
      collaboratorId: 'owner-1',
      companyId: 'company-1',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.collaborators[0]).toBeInstanceOf(Collaborator)
      expect(response.value.collaborators).toHaveLength(10)
      expect(response.value.size).toBe(10)
      expect(response.value.page).toBe(1)
    }
  })
})
