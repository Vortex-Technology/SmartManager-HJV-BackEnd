import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { UsersInMemoryRepository } from '@test/repositories/modules/user/UsersInMemoryRepository'
import { CompaniesInMemoryRepository } from '@test/repositories/modules/company/CompaniesInMemoryRepository'
import { makeUser } from '@test/factories/modules/user/makeUser'
import { UserNotFount } from '@modules/user/errors/UserNotFound'
import { MarketsInMemoryRepository } from '@test/repositories/modules/market/MarketsInMemoryRepository'
import { CollaboratorsInMemoryRepository } from '@test/repositories/modules/collaborator/CollaboratorsInMemoryRepository'
import { InventoriesInMemoryRepository } from '@test/repositories/modules/inventory/InventoriesInMemoryRepository'
import { ProductVariantInventoriesInMemoryRepository } from '@test/repositories/modules/inventory/ProductVariantInventoriesInMemoryRepository'
import { GenerateApiKeyService } from './GenerateApiKey.service'
import { ApiKeysInMemoryRepository } from '@test/repositories/modules/company/ApiKeysInMemoryRepository'
import { FakeHasher } from '@test/repositories/providers/cryptography/fakeHasher'
import { makeCompany } from '@test/factories/modules/company/makeCompany'
import { ApiKey } from '../entities/ApiKey'
import { CompanyNotFound } from '../errors/CompanyNotFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { makeApiKey } from '@test/factories/modules/company/makeApiKey'
import { LotsOfExistingKeys } from '../errors/LotsOfExistingKeys'

let usersInMemoryRepository: UsersInMemoryRepository
let productVariantInventoriesInMemoryRepository: ProductVariantInventoriesInMemoryRepository
let inventoriesInMemoryRepository: InventoriesInMemoryRepository
let collaboratorsInMemoryRepository: CollaboratorsInMemoryRepository
let marketsInMemoryRepository: MarketsInMemoryRepository
let companiesInMemoryRepository: CompaniesInMemoryRepository
let apiKeysInMemoryRepository: ApiKeysInMemoryRepository
let fakeHasher: FakeHasher

let sut: GenerateApiKeyService

describe('Generate api key', () => {
  beforeEach(() => {
    usersInMemoryRepository = new UsersInMemoryRepository()
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

    sut = new GenerateApiKeyService(
      usersInMemoryRepository,
      companiesInMemoryRepository,
      apiKeysInMemoryRepository,
      fakeHasher,
      fakeHasher,
    )
  })

  it('should be able to generate a api key for company', async () => {
    const user = makeUser({}, new UniqueEntityId('user-1'))
    await usersInMemoryRepository.create(user)

    const company = makeCompany(
      {
        ownerId: user.id,
      },
      new UniqueEntityId('company-1'),
    )
    await companiesInMemoryRepository.create(company)

    const response = await sut.execute({
      companyId: 'company-1',
      userId: 'user-1',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.apiKey).toBeInstanceOf(ApiKey)
    }
  })

  it('not should be able to generate a api key for company if user not exists', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const response = await sut.execute({
      companyId: 'company-1',
      userId: 'inexistent-user-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(UserNotFount)
  })

  it('not should be able to generate a api key for company if company not exists', async () => {
    const user = makeUser({}, new UniqueEntityId('user-1'))
    await usersInMemoryRepository.create(user)

    const response = await sut.execute({
      companyId: 'inexistent-company-id',
      userId: 'user-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CompanyNotFound)
  })

  it('not should be able to generate a api key for company if requester is not owner of company', async () => {
    const user = makeUser({}, new UniqueEntityId('user-1'))
    await usersInMemoryRepository.create(user)

    const company = makeCompany(
      {
        ownerId: new UniqueEntityId('other-user-id'),
      },
      new UniqueEntityId('company-1'),
    )
    await companiesInMemoryRepository.create(company)

    const response = await sut.execute({
      companyId: 'company-1',
      userId: 'user-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it('not should be able to generate a api key for company if user already has an api key active', async () => {
    const user = makeUser({}, new UniqueEntityId('user-1'))
    await usersInMemoryRepository.create(user)

    const company = makeCompany(
      {
        ownerId: user.id,
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
      userId: 'user-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(LotsOfExistingKeys)
  })
})
