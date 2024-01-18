import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { CompaniesInMemoryRepository } from '@test/repositories/modules/company/CompaniesInMemoryRepository'
import { MarketsInMemoryRepository } from '@test/repositories/modules/market/MarketsInMemoryRepository'
import { CollaboratorsInMemoryRepository } from '@test/repositories/modules/collaborator/CollaboratorsInMemoryRepository'
import { InventoriesInMemoryRepository } from '@test/repositories/modules/inventory/InventoriesInMemoryRepository'
import { ProductVariantInventoriesInMemoryRepository } from '@test/repositories/modules/inventory/ProductVariantInventoriesInMemoryRepository'
import { ValidateApiKeyService } from './ValidateApiKey.service'
import { ApiKeysInMemoryRepository } from '@test/repositories/modules/company/ApiKeysInMemoryRepository'
import { FakeHasher } from '@test/repositories/providers/cryptography/fakeHasher'
import { makeCompany } from '@test/factories/modules/company/makeCompany'
import { CompanyNotFound } from '../errors/CompanyNotFound'
import { makeApiKey } from '@test/factories/modules/company/makeApiKey'
import { ApiKeyIsRevoked } from '../errors/ApiKeyIsRevoked'

let productVariantInventoriesInMemoryRepository: ProductVariantInventoriesInMemoryRepository
let inventoriesInMemoryRepository: InventoriesInMemoryRepository
let collaboratorsInMemoryRepository: CollaboratorsInMemoryRepository
let marketsInMemoryRepository: MarketsInMemoryRepository
let companiesInMemoryRepository: CompaniesInMemoryRepository
let apiKeysInMemoryRepository: ApiKeysInMemoryRepository
let fakeHasher: FakeHasher

let sut: ValidateApiKeyService

describe('Validate api key', () => {
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
    apiKeysInMemoryRepository = new ApiKeysInMemoryRepository()
    fakeHasher = new FakeHasher()

    sut = new ValidateApiKeyService(
      companiesInMemoryRepository,
      apiKeysInMemoryRepository,
      fakeHasher,
    )
  })

  it('should be able to validate a api key for company', async () => {
    const company = makeCompany(
      {
        companyName: 'Vortex',
      },
      new UniqueEntityId('company-1'),
    )
    await companiesInMemoryRepository.create(company)

    const key = await fakeHasher.hash('Vortex' + 'segredo')
    const apiKey = makeApiKey({
      companyId: company.id,
      revokedAt: null,
      key,
      secret: 'segredo',
    })

    await apiKeysInMemoryRepository.create(apiKey)

    const response = await sut.execute({
      key,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.valid).toEqual(true)
    }
  })

  it('not should be able to validate a api key for company if api key not exists', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const response = await sut.execute({
      key: 'inexistent-key',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.valid).toEqual(false)
    }
  })

  it('not should be able to validate a api key for company if key is revoked', async () => {
    const company = makeCompany(
      {
        companyName: 'Vortex',
      },
      new UniqueEntityId('company-1'),
    )
    await companiesInMemoryRepository.create(company)

    const key = await fakeHasher.hash('Vortex' + 'segredo')
    const apiKey = makeApiKey({
      companyId: company.id,
      revokedAt: new Date(),
      key,
      secret: 'segredo',
    })

    await apiKeysInMemoryRepository.create(apiKey)

    const response = await sut.execute({
      key,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ApiKeyIsRevoked)
  })

  it('not should be able to validate a api key for company if company not exists', async () => {
    const key = await fakeHasher.hash('Vortex' + 'segredo')
    const apiKey = makeApiKey({
      companyId: new UniqueEntityId('inexistent-company-id'),
      revokedAt: null,
      key,
      secret: 'segredo',
    })

    await apiKeysInMemoryRepository.create(apiKey)

    const response = await sut.execute({
      key,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CompanyNotFound)
  })

  it('not should be able to validate a api key for company if key is invalid', async () => {
    const company = makeCompany(
      {
        companyName: 'Vortex',
      },
      new UniqueEntityId('company-1'),
    )
    await companiesInMemoryRepository.create(company)

    const key = await fakeHasher.hash('Vortex' + 'segredo')
    const apiKey = makeApiKey({
      companyId: company.id,
      revokedAt: null,
      key,
      secret: 'segredo-supremo',
    })

    await apiKeysInMemoryRepository.create(apiKey)

    const response = await sut.execute({
      key,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.valid).toEqual(false)
    }
  })
})
