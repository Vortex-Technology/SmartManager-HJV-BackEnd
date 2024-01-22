import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { CompaniesInMemoryRepository } from '@test/repositories/modules/company/CompaniesInMemoryRepository'
import { MarketsInMemoryRepository } from '@test/repositories/modules/market/MarketsInMemoryRepository'
import { CollaboratorsInMemoryRepository } from '@test/repositories/modules/collaborator/CollaboratorsInMemoryRepository'
import { InventoriesInMemoryRepository } from '@test/repositories/modules/inventory/InventoriesInMemoryRepository'
import { ProductVariantInventoriesInMemoryRepository } from '@test/repositories/modules/inventory/ProductVariantInventoriesInMemoryRepository'
import { GenerateApiKeyCompanyService } from './GenerateApiKeyCompany.service'
import { ApiKeysInMemoryRepository } from '@test/repositories/modules/company/ApiKeysInMemoryRepository'
import { FakeHasher } from '@test/repositories/providers/cryptography/fakeHasher'
import { makeCompany } from '@test/factories/modules/company/makeCompany'
import { ApiKey } from '../entities/ApiKey'
import { CompanyNotFound } from '../errors/CompanyNotFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { makeApiKey } from '@test/factories/modules/company/makeApiKey'
import { LotsOfExistingKeys } from '../errors/LotsOfExistingKeys'
import { OwnersInMemoryRepository } from '@test/repositories/modules/owner/OwnersInMemoryRepository'
import { makeOwner } from '@test/factories/modules/owner/makeOwner'

let ownersInMemoryRepository: OwnersInMemoryRepository
let productVariantInventoriesInMemoryRepository: ProductVariantInventoriesInMemoryRepository
let inventoriesInMemoryRepository: InventoriesInMemoryRepository
let collaboratorsInMemoryRepository: CollaboratorsInMemoryRepository
let marketsInMemoryRepository: MarketsInMemoryRepository
let companiesInMemoryRepository: CompaniesInMemoryRepository
let apiKeysInMemoryRepository: ApiKeysInMemoryRepository
let fakeHasher: FakeHasher

let sut: GenerateApiKeyCompanyService

describe('Generate api key', () => {
  beforeEach(() => {
    collaboratorsInMemoryRepository = new CollaboratorsInMemoryRepository()
    ownersInMemoryRepository = new OwnersInMemoryRepository(
      collaboratorsInMemoryRepository,
    )
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

    sut = new GenerateApiKeyCompanyService(
      ownersInMemoryRepository,
      companiesInMemoryRepository,
      apiKeysInMemoryRepository,
      fakeHasher,
      fakeHasher,
    )
  })

  it('should be able to generate a api key for company', async () => {
    const owner = makeOwner(
      {
        companyId: new UniqueEntityId('company-1'),
      },
      new UniqueEntityId('owner-1'),
    )
    await ownersInMemoryRepository.create(owner)

    const company = makeCompany(
      {
        ownerId: owner.id,
      },
      new UniqueEntityId('company-1'),
    )
    await companiesInMemoryRepository.create(company)

    const response = await sut.execute({
      companyId: 'company-1',
      requesterId: 'owner-1',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.apiKey).toBeInstanceOf(ApiKey)
    }
  })

  it('not should be able to generate a api key for company if owner not exists', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const response = await sut.execute({
      companyId: 'company-1',
      requesterId: 'inexistent-user-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it('not should be able to generate a api key for company if company not exists', async () => {
    const user = makeOwner({}, new UniqueEntityId('owner-1'))
    await ownersInMemoryRepository.create(user)

    const response = await sut.execute({
      companyId: 'inexistent-company-id',
      requesterId: 'owner-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CompanyNotFound)
  })

  it('not should be able to generate a api key for company if requester is not owner of company', async () => {
    const user = makeOwner({}, new UniqueEntityId('owner-1'))
    await ownersInMemoryRepository.create(user)

    const company = makeCompany(
      {
        ownerId: new UniqueEntityId('other-owner-id'),
      },
      new UniqueEntityId('company-1'),
    )
    await companiesInMemoryRepository.create(company)

    const response = await sut.execute({
      companyId: 'company-1',
      requesterId: 'owner-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it('not should be able to generate a api key for company if user already has an api key active', async () => {
    const owner = makeOwner(
      {
        companyId: new UniqueEntityId('company-1'),
      },
      new UniqueEntityId('owner-1'),
    )
    await ownersInMemoryRepository.create(owner)

    const company = makeCompany(
      {
        ownerId: owner.id,
      },
      new UniqueEntityId('company-1'),
    )
    await companiesInMemoryRepository.create(company)

    const apiKey = makeApiKey({
      companyId: company.id,
      revokedAt: null,
    })
    await apiKeysInMemoryRepository.create(apiKey)

    const response = await sut.execute({
      companyId: 'company-1',
      requesterId: 'owner-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(LotsOfExistingKeys)
  })
})
