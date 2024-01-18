import { FakeHasher } from '@test/repositories/providers/cryptography/fakeHasher'
import { FakeEncrypter } from '@test/repositories/providers/cryptography/fakeEncrypter'
import { FakeEnv } from '@test/config/env/fakeEnv'
import { DayJs } from '@providers/date/implementations/dayJs'
import { CollaboratorWrongCredentials } from '../errors/CollaboratorWrongCredentials'
import { RefreshTokensInMemoryRepository } from '@test/repositories/modules/refreshToken/RefreshTokensInMemoryRepository'
import { CollaboratorsInMemoryRepository } from '@test/repositories/modules/collaborator/CollaboratorsInMemoryRepository'
import { LoginCollaboratorService } from './LoginCollaborator.service'
import { MarketsInMemoryRepository } from '@test/repositories/modules/market/MarketsInMemoryRepository'
import { CompaniesInMemoryRepository } from '@test/repositories/modules/company/CompaniesInMemoryRepository'
import { InventoriesInMemoryRepository } from '@test/repositories/modules/inventory/InventoriesInMemoryRepository'
import { ProductVariantInventoriesInMemoryRepository } from '@test/repositories/modules/inventory/ProductVariantInventoriesInMemoryRepository'
import { makeManager } from '@test/factories/modules/manager/makeManager'
import { makeCompany } from '@test/factories/modules/company/makeCompany'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { makeMarket } from '@test/factories/modules/market/makeMarket'
import { CompanyStatus } from '@modules/company/entities/Company'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { MarketNotFound } from '@modules/market/errors/MarketNorFound'
import { CompanyInactive } from '@modules/company/errors/CompanyInactive'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { makeSeller } from '@test/factories/modules/seller/makeSeller'
import { EnvService } from '@infra/env/Env.service'
import { ApiKeysInMemoryRepository } from '@test/repositories/modules/company/ApiKeysInMemoryRepository'
import { makeApiKey } from '@test/factories/modules/company/makeApiKey'
import { ApiKeyIsRevoked } from '@modules/company/errors/ApiKeyIsRevoked'

let apiKesInMemoryRepository: ApiKeysInMemoryRepository
let collaboratorsInMemoryRepository: CollaboratorsInMemoryRepository
let marketsInMemoryRepository: MarketsInMemoryRepository
let productVariantInventoriesInMemoryRepository: ProductVariantInventoriesInMemoryRepository
let inventoriesInMemoryRepository: InventoriesInMemoryRepository
let companiesInMemoryRepository: CompaniesInMemoryRepository
let fakeHasher: FakeHasher
let fakeEncrypter: FakeEncrypter
let fakeEnv: FakeEnv
let fakeDateProvider: DayJs
let refreshTokensInMemoryRepository: RefreshTokensInMemoryRepository

let sut: LoginCollaboratorService

describe('Login Collaborator', () => {
  beforeEach(() => {
    apiKesInMemoryRepository = new ApiKeysInMemoryRepository()
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
    fakeHasher = new FakeHasher()
    fakeEncrypter = new FakeEncrypter()
    fakeEnv = new FakeEnv()
    fakeDateProvider = new DayJs()
    refreshTokensInMemoryRepository = new RefreshTokensInMemoryRepository()

    sut = new LoginCollaboratorService(
      apiKesInMemoryRepository,
      companiesInMemoryRepository,
      marketsInMemoryRepository,
      collaboratorsInMemoryRepository,
      refreshTokensInMemoryRepository,
      fakeHasher,
      fakeEncrypter,
      fakeEnv as EnvService,
      fakeDateProvider,
    )
  })

  it('should be able to create a new session to collaborator', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const apiKey = makeApiKey()
    await apiKesInMemoryRepository.create(apiKey)

    const market = makeMarket(
      { companyId: company.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const passwordHash = await fakeHasher.hash('12345678')

    const collaborator = makeManager({
      email: 'jonas@jonas.com',
      password: passwordHash,
      marketId: market.id,
    })
    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      email: 'jonas@jonas.com',
      password: '12345678',
      companyId: 'company-1',
      marketId: 'market-1',
      apiKey: apiKey.key,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        }),
      )
    }
  })

  it('not should be able to create a new session to collaborator if company not exists', async () => {
    const market = makeMarket({}, new UniqueEntityId('market-1'))
    marketsInMemoryRepository.markets.push(market)

    const passwordHash = await fakeHasher.hash('12345678')

    const apiKey = makeApiKey()
    await apiKesInMemoryRepository.create(apiKey)

    const collaborator = makeManager({
      email: 'jonas@jonas.com',
      password: passwordHash,
      marketId: market.id,
    })
    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      email: 'jonas@jonas.com',
      password: '12345678',
      companyId: 'inexistent-company-id',
      marketId: 'market-1',
      apiKey: apiKey.key,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CompanyNotFound)
  })

  it('not should be able to create a new session to collaborator if market not exists', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const passwordHash = await fakeHasher.hash('12345678')

    const apiKey = makeApiKey()
    await apiKesInMemoryRepository.create(apiKey)

    const collaborator = makeManager({
      email: 'jonas@jonas.com',
      password: passwordHash,
    })
    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      email: 'jonas@jonas.com',
      password: '12345678',
      companyId: 'company-1',
      marketId: 'inexistent-market-id',
      apiKey: apiKey.key,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(MarketNotFound)
  })

  it('not should be able to create a new session to collaborator if company is not active', async () => {
    const company = makeCompany(
      {
        status: CompanyStatus.INACTIVE,
      },
      new UniqueEntityId('company-1'),
    )
    await companiesInMemoryRepository.create(company)

    const market = makeMarket(
      { companyId: company.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const passwordHash = await fakeHasher.hash('12345678')

    const apiKey = makeApiKey()
    await apiKesInMemoryRepository.create(apiKey)

    const collaborator = makeManager({
      email: 'jonas@jonas.com',
      password: passwordHash,
      marketId: market.id,
    })
    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      email: 'jonas@jonas.com',
      password: '12345678',
      companyId: 'company-1',
      marketId: 'market-1',
      apiKey: apiKey.key,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CompanyInactive)
  })

  it('not should be able to create a new session to collaborator if market does not belong to company', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const market = makeMarket(
      { companyId: new UniqueEntityId('other-company-id') },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const passwordHash = await fakeHasher.hash('12345678')
    const apiKey = makeApiKey()
    await apiKesInMemoryRepository.create(apiKey)

    const collaborator = makeManager({
      email: 'jonas@jonas.com',
      password: passwordHash,
      marketId: market.id,
    })
    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      email: 'jonas@jonas.com',
      password: '12345678',
      companyId: 'company-1',
      marketId: 'market-1',
      apiKey: apiKey.key,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it('not should be able to create a new session to collaborator if collaborator does not belong to market', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const market = makeMarket(
      { companyId: company.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const passwordHash = await fakeHasher.hash('12345678')
    const apiKey = makeApiKey()
    await apiKesInMemoryRepository.create(apiKey)

    const collaborator = makeManager({
      email: 'jonas@jonas.com',
      password: passwordHash,
      marketId: new UniqueEntityId('other-market-id'),
    })
    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      email: 'jonas@jonas.com',
      password: '12345678',
      companyId: 'company-1',
      marketId: 'market-1',
      apiKey: apiKey.key,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it('not should be able to create a new session to collaborator if it not exists', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const market = makeMarket(
      { companyId: company.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const apiKey = makeApiKey()
    await apiKesInMemoryRepository.create(apiKey)

    const response = await sut.execute({
      email: 'inexistent@collaborator.com',
      password: '12345678',
      companyId: 'company-1',
      marketId: 'market-1',
      apiKey: apiKey.key,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CollaboratorWrongCredentials)
  })

  it('not should be able to create a new session to collaborator if password is wrong', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const market = makeMarket(
      { companyId: company.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const passwordHash = await fakeHasher.hash('12345678')

    const apiKey = makeApiKey()
    await apiKesInMemoryRepository.create(apiKey)

    const collaborator = makeSeller({
      email: 'jonas@jonas.com',
      password: passwordHash,
      marketId: market.id,
    })
    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      email: 'jonas@joans.com',
      password: 'wrong-password',
      companyId: 'company-1',
      marketId: 'market-1',
      apiKey: apiKey.key,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CollaboratorWrongCredentials)
  })

  it('not should be able to create a new session to collaborator if api key not exists', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const market = makeMarket(
      { companyId: company.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const passwordHash = await fakeHasher.hash('12345678')

    const collaborator = makeSeller({
      email: 'jonas@jonas.com',
      password: passwordHash,
      marketId: market.id,
    })
    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      email: 'jonas@joans.com',
      password: 'wrong-password',
      companyId: 'company-1',
      marketId: 'market-1',
      apiKey: 'inexistent-api-key',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it('not should be able to create a new session to collaborator if api key is revoked', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const market = makeMarket(
      { companyId: company.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const passwordHash = await fakeHasher.hash('12345678')

    const apiKey = makeApiKey({
      revokedAt: new Date(),
    })
    await apiKesInMemoryRepository.create(apiKey)

    const collaborator = makeSeller({
      email: 'jonas@jonas.com',
      password: passwordHash,
      marketId: market.id,
    })
    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      email: 'jonas@joans.com',
      password: 'wrong-password',
      companyId: 'company-1',
      marketId: 'market-1',
      apiKey: apiKey.key,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ApiKeyIsRevoked)
  })
})
