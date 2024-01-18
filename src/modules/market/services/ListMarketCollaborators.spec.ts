import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { ListMarketCollaboratorsService } from './ListMarketCollaborators.service'
import { MarketsInMemoryRepository } from '@test/repositories/modules/market/MarketsInMemoryRepository'
import { CollaboratorsInMemoryRepository } from '@test/repositories/modules/collaborator/CollaboratorsInMemoryRepository'
import { InventoriesInMemoryRepository } from '@test/repositories/modules/inventory/InventoriesInMemoryRepository'
import { ProductVariantInventoriesInMemoryRepository } from '@test/repositories/modules/inventory/ProductVariantInventoriesInMemoryRepository'
import { makeMarket } from '@test/factories/modules/market/makeMarket'
import { makeManager } from '@test/factories/modules/manager/makeManager'
import { Collaborator } from '@modules/collaborator/entities/Collaborator'
import { MarketNotFound } from '../errors/MarketNorFound'
import { CollaboratorNotFound } from '@modules/refreshToken/errors/CollaboratorNotFound'
import { makeSeller } from '@test/factories/modules/seller/makeSeller'
import { PermissionDenied } from '@shared/errors/PermissionDenied'

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

    sut = new ListMarketCollaboratorsService(
      marketsInMemoryRepository,
      collaboratorsInMemoryRepository,
    )
  })

  it('should be able to list market collaborators', async () => {
    const market = makeMarket({}, new UniqueEntityId('market-1'))
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
    const market = makeMarket({}, new UniqueEntityId('market-1'))
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
    const collaborator = makeManager({}, new UniqueEntityId('manager-1'))
    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      marketId: 'inexistent-market-id',
      page: 1,
      limit: 30,
      collaboratorId: 'manager-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(MarketNotFound)
  })

  it('not should be able to list market collaborators if requester not exist', async () => {
    const market = makeMarket({}, new UniqueEntityId('market-1'))
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
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CollaboratorNotFound)
  })

  it('not should be able to list market collaborators if requester does not have permission', async () => {
    const market = makeMarket({}, new UniqueEntityId('market-1'))
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
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it('not should be able to list market collaborators of other markets', async () => {
    const market = makeMarket({}, new UniqueEntityId('market-1'))
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
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })
})
