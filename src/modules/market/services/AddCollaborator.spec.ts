import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { UsersInMemoryRepository } from '@test/repositories/modules/user/UsersInMemoryRepository'
import { makeUser } from '@test/factories/modules/user/makeUser'
import { MarketsInMemoryRepository } from '@test/repositories/modules/market/MarketsInMemoryRepository'
import { CompaniesInMemoryRepository } from '@test/repositories/modules/company/CompaniesInMemoryRepository'
import { makeCompany } from '@test/factories/modules/company/makeCompany'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { FakeHasher } from '@test/repositories/providers/cryptography/fakeHasher'
import { CollaboratorsInMemoryRepository } from '@test/repositories/modules/collaborator/CollaboratorsInMemoryRepository'
import { makeMarket } from '@test/factories/modules/market/makeMarket'
import { CompanyMarketsList } from '@modules/company/entities/CompanyMarketsList'
import {
  Collaborator,
  CollaboratorRole,
} from '@modules/collaborator/entities/Collaborator'
import { MarketNotFound } from '../errors/MarketNorFound'
import { makeManager } from '@test/factories/modules/manager/makeManager'
import { makeSeller } from '@test/factories/modules/seller/makeSeller'
import { CollaboratorNotFound } from '@modules/refreshToken/errors/CollaboratorNotFound'
import { AddCollaboratorService } from './AddCollaborator.service'
import { UserNotFount } from '@modules/user/errors/UserNotFound'

let usersInMemoryRepository: UsersInMemoryRepository
let marketsInMemoryRepository: MarketsInMemoryRepository
let companiesInMemoryRepository: CompaniesInMemoryRepository
let collaboratorsInMemoryRepository: CollaboratorsInMemoryRepository
let fakeHasher: FakeHasher

let sut: AddCollaboratorService

describe('Add collaborator', () => {
  beforeEach(() => {
    usersInMemoryRepository = new UsersInMemoryRepository()
    collaboratorsInMemoryRepository = new CollaboratorsInMemoryRepository()
    marketsInMemoryRepository = new MarketsInMemoryRepository(
      collaboratorsInMemoryRepository,
    )
    companiesInMemoryRepository = new CompaniesInMemoryRepository(
      marketsInMemoryRepository,
    )
    fakeHasher = new FakeHasher()

    sut = new AddCollaboratorService(
      usersInMemoryRepository,
      companiesInMemoryRepository,
      marketsInMemoryRepository,
      collaboratorsInMemoryRepository,
      fakeHasher,
    )
  })

  it('should be able to add a collaborator per collaborator on market', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    const market = makeMarket(
      {
        companyId: company.id,
      },
      new UniqueEntityId('market-1'),
    )

    company.markets = new CompanyMarketsList()
    company.markets.add(market)

    await companiesInMemoryRepository.create(company)

    const collaborator = makeManager(
      {
        marketId: market.id,
      },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      actualRemuneration: 100000,
      collaboratorRole: CollaboratorRole.MANAGER,
      companyId: 'company-1',
      email: 'jonas@jonas.com',
      marketId: 'market-1',
      name: 'Jonas',
      creatorId: 'manager-1',
      password: '123456',
      creatorType: 'COLLABORATOR',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.collaborator).toBeInstanceOf(Collaborator)
      expect(companiesInMemoryRepository.companies).toHaveLength(1)
      expect(marketsInMemoryRepository.markets).toHaveLength(1)
      expect(collaboratorsInMemoryRepository.collaborators).toHaveLength(2)
    }
  })

  it('should be able to add a collaborator per owner on market', async () => {
    const creator = makeUser({}, new UniqueEntityId('user-1'))
    await usersInMemoryRepository.create(creator)

    const company = makeCompany(
      { ownerId: creator.id },
      new UniqueEntityId('company-1'),
    )

    const market = makeMarket(
      {
        companyId: company.id,
      },
      new UniqueEntityId('market-1'),
    )

    company.markets = new CompanyMarketsList()
    company.markets.add(market)

    await companiesInMemoryRepository.create(company)

    const response = await sut.execute({
      actualRemuneration: 100000,
      collaboratorRole: CollaboratorRole.MANAGER,
      companyId: 'company-1',
      email: 'jonas@jonas.com',
      marketId: 'market-1',
      name: 'Jonas',
      creatorId: 'user-1',
      password: '123456',
      creatorType: 'OWNER',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.collaborator).toBeInstanceOf(Collaborator)
      expect(companiesInMemoryRepository.companies).toHaveLength(1)
      expect(marketsInMemoryRepository.markets).toHaveLength(1)
      expect(collaboratorsInMemoryRepository.collaborators).toHaveLength(1)
      expect(usersInMemoryRepository.users).toHaveLength(2)
    }
  })

  it('not should be able to add a collaborator per collaborator on market if collaborator not exists', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))

    const market = makeMarket(
      {
        companyId: company.id,
      },
      new UniqueEntityId('market-1'),
    )

    company.markets = new CompanyMarketsList()
    company.markets.add(market)

    await companiesInMemoryRepository.create(company)

    const response = await sut.execute({
      actualRemuneration: 100000,
      collaboratorRole: CollaboratorRole.MANAGER,
      companyId: 'company-1',
      email: 'jonas@jonas.com',
      marketId: 'market-1',
      name: 'Jonas',
      creatorId: 'inexistent-collaborator-id',
      password: '123456',
      creatorType: 'COLLABORATOR',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CollaboratorNotFound)
    expect(collaboratorsInMemoryRepository.collaborators).toHaveLength(0)
  })

  it('not should be able to add a collaborator per owner on market if owner not exists', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))

    const market = makeMarket(
      {
        companyId: company.id,
      },
      new UniqueEntityId('market-1'),
    )

    company.markets = new CompanyMarketsList()
    company.markets.add(market)

    await companiesInMemoryRepository.create(company)

    const response = await sut.execute({
      actualRemuneration: 100000,
      collaboratorRole: CollaboratorRole.MANAGER,
      companyId: 'company-1',
      email: 'jonas@jonas.com',
      marketId: 'market-1',
      name: 'Jonas',
      creatorId: 'inexistent-owner-id',
      password: '123456',
      creatorType: 'OWNER',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(UserNotFount)
    expect(collaboratorsInMemoryRepository.collaborators).toHaveLength(0)
    expect(usersInMemoryRepository.users).toHaveLength(0)
  })

  it('not should be able to add a collaborator per collaborator on market if company not exists', async () => {
    const market = makeMarket({}, new UniqueEntityId('market-1'))
    marketsInMemoryRepository.markets.push(market)

    const collaborator = makeManager(
      {
        marketId: market.id,
      },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      actualRemuneration: 100000,
      collaboratorRole: CollaboratorRole.MANAGER,
      companyId: 'inexistent-company-id',
      email: 'jonas@jonas.com',
      marketId: 'market-1',
      name: 'Jonas',
      creatorId: 'manager-1',
      password: '123456',
      creatorType: 'COLLABORATOR',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CompanyNotFound)
    expect(collaboratorsInMemoryRepository.collaborators).toHaveLength(1)
  })

  it('not should be able to add a collaborator per owner on market if company not exists', async () => {
    const creator = makeUser({}, new UniqueEntityId('user-1'))
    await usersInMemoryRepository.create(creator)

    const market = makeMarket({}, new UniqueEntityId('market-1'))
    marketsInMemoryRepository.markets.push(market)

    const response = await sut.execute({
      actualRemuneration: 100000,
      collaboratorRole: CollaboratorRole.MANAGER,
      companyId: 'inexistent-company-id',
      email: 'jonas@jonas.com',
      marketId: 'market-1',
      name: 'Jonas',
      creatorId: 'user-1',
      password: '123456',
      creatorType: 'OWNER',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CompanyNotFound)
    expect(collaboratorsInMemoryRepository.collaborators).toHaveLength(0)
    expect(usersInMemoryRepository.users).toHaveLength(1)
  })

  it('not should be able to add a collaborator per collaborator on market if market not exists', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const collaborator = makeManager({}, new UniqueEntityId('manager-1'))
    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      actualRemuneration: 100000,
      collaboratorRole: CollaboratorRole.MANAGER,
      companyId: 'company-1',
      email: 'jonas@jonas.com',
      marketId: 'inexistent-market-id',
      name: 'Jonas',
      creatorId: 'manager-1',
      password: '123456',
      creatorType: 'COLLABORATOR',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(MarketNotFound)
    expect(collaboratorsInMemoryRepository.collaborators).toHaveLength(1)
  })

  it('not should be able to add a collaborator per owner on market if market not exists', async () => {
    const creator = makeUser({}, new UniqueEntityId('user-1'))
    await usersInMemoryRepository.create(creator)

    const company = makeCompany(
      { ownerId: creator.id },
      new UniqueEntityId('company-1'),
    )
    await companiesInMemoryRepository.create(company)

    const response = await sut.execute({
      actualRemuneration: 100000,
      collaboratorRole: CollaboratorRole.MANAGER,
      companyId: 'company-1',
      email: 'jonas@jonas.com',
      marketId: 'inexistent-market-id',
      name: 'Jonas',
      creatorId: 'user-1',
      password: '123456',
      creatorType: 'OWNER',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(MarketNotFound)
    expect(collaboratorsInMemoryRepository.collaborators).toHaveLength(0)
    expect(usersInMemoryRepository.users).toHaveLength(1)
  })

  it('not should be able to add a collaborator per collaborator on market if creator not is collaborator manager of the market', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))

    const market = makeMarket(
      {
        companyId: company.id,
      },
      new UniqueEntityId('market-1'),
    )

    company.markets = new CompanyMarketsList()
    company.markets.add(market)

    await companiesInMemoryRepository.create(company)

    const collaborator = makeSeller(
      {
        marketId: market.id,
      },
      new UniqueEntityId('seller-1'),
    )
    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      actualRemuneration: 100000,
      collaboratorRole: CollaboratorRole.MANAGER,
      companyId: 'company-1',
      email: 'jonas@jonas.com',
      marketId: 'market-1',
      name: 'Jonas',
      creatorId: 'seller-1',
      password: '123456',
      creatorType: 'COLLABORATOR',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
    expect(collaboratorsInMemoryRepository.collaborators).toHaveLength(1)
    expect(usersInMemoryRepository.users).toHaveLength(0)
  })

  it('not should be able to add a collaborator per owner on market if creator not is owner of the company', async () => {
    const creator = makeUser({}, new UniqueEntityId('user-1'))
    await usersInMemoryRepository.create(creator)

    const company = makeCompany(
      { ownerId: new UniqueEntityId('other-user-id') },
      new UniqueEntityId('company-1'),
    )

    const market = makeMarket(
      {
        companyId: company.id,
      },
      new UniqueEntityId('market-1'),
    )

    company.markets = new CompanyMarketsList()
    company.markets.add(market)

    await companiesInMemoryRepository.create(company)

    const response = await sut.execute({
      actualRemuneration: 100000,
      collaboratorRole: CollaboratorRole.MANAGER,
      companyId: 'company-1',
      email: 'jonas@jonas.com',
      marketId: 'market-1',
      name: 'Jonas',
      creatorId: 'user-1',
      password: '123456',
      creatorType: 'OWNER',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
    expect(collaboratorsInMemoryRepository.collaborators).toHaveLength(0)
    expect(usersInMemoryRepository.users).toHaveLength(1)
  })

  it('should be able to add a collaborator per collaborator on market', async () => {
    const user = makeUser({
      email: 'jonas@jonas.com',
    })
    await usersInMemoryRepository.create(user)

    const company = makeCompany({}, new UniqueEntityId('company-1'))

    const market = makeMarket(
      {
        companyId: company.id,
      },
      new UniqueEntityId('market-1'),
    )

    company.markets = new CompanyMarketsList()
    company.markets.add(market)

    await companiesInMemoryRepository.create(company)

    const collaborator = makeManager(
      {
        marketId: market.id,
      },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      actualRemuneration: 100000,
      collaboratorRole: CollaboratorRole.MANAGER,
      companyId: 'company-1',
      email: 'jonas@jonas.com',
      marketId: 'market-1',
      name: 'Jonas',
      creatorId: 'manager-1',
      password: '123456',
      creatorType: 'COLLABORATOR',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.collaborator).toBeInstanceOf(Collaborator)
      expect(companiesInMemoryRepository.companies).toHaveLength(1)
      expect(marketsInMemoryRepository.markets).toHaveLength(1)
      expect(collaboratorsInMemoryRepository.collaborators).toHaveLength(2)
      expect(usersInMemoryRepository.users).toHaveLength(1)
    }
  })

  it('should be able to add a collaborator per owner on market', async () => {
    const creator = makeUser({}, new UniqueEntityId('user-1'))
    const user = makeUser({
      email: 'jonas@jonas.com',
    })
    await usersInMemoryRepository.create(creator)
    await usersInMemoryRepository.create(user)

    const company = makeCompany(
      { ownerId: creator.id },
      new UniqueEntityId('company-1'),
    )

    const market = makeMarket(
      {
        companyId: company.id,
      },
      new UniqueEntityId('market-1'),
    )

    company.markets = new CompanyMarketsList()
    company.markets.add(market)

    await companiesInMemoryRepository.create(company)

    const response = await sut.execute({
      actualRemuneration: 100000,
      collaboratorRole: CollaboratorRole.MANAGER,
      companyId: 'company-1',
      email: 'jonas@jonas.com',
      marketId: 'market-1',
      name: 'Jonas',
      creatorId: 'user-1',
      password: '123456',
      creatorType: 'OWNER',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.collaborator).toBeInstanceOf(Collaborator)
      expect(companiesInMemoryRepository.companies).toHaveLength(1)
      expect(marketsInMemoryRepository.markets).toHaveLength(1)
      expect(collaboratorsInMemoryRepository.collaborators).toHaveLength(1)
      expect(usersInMemoryRepository.users).toHaveLength(2)
    }
  })
})
