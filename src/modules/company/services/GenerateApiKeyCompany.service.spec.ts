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
import { makeApiKey } from '@test/factories/modules/company/makeApiKey'
import { LotsOfExistingKeys } from '../errors/LotsOfExistingKeys'
import { OwnersInMemoryRepository } from '@test/repositories/modules/owner/OwnersInMemoryRepository'
import { makeOwner } from '@test/factories/modules/owner/makeOwner'
import { UsersInMemoryRepository } from '@test/repositories/modules/user/UsersInMemoryRepository'
import { makeUser } from '@test/factories/modules/user/makeUser'
import { UserNotFound } from '@modules/user/errors/UserNotFound'

let usersInMemoryRepository: UsersInMemoryRepository
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
      ownersInMemoryRepository,
    )

    usersInMemoryRepository = new UsersInMemoryRepository()

    apiKeysInMemoryRepository = new ApiKeysInMemoryRepository()

    fakeHasher = new FakeHasher()

    sut = new GenerateApiKeyCompanyService(
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
        founderId: user.id,
      },
      new UniqueEntityId('company-1'),
    )
    await companiesInMemoryRepository.create(company)

    const response = await sut.execute({
      userId: 'user-1',
      companyId: 'company-1',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.apiKey).toBeInstanceOf(ApiKey)
    }
  })

  it('not should be able to generate a api key for company if founder not exists', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const response = await sut.execute({
      userId: 'inexistent-user-1',
      companyId: 'company-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(UserNotFound)
  })

  it('not should be able to generate a api key for company if company not exists', async () => {
    const user = makeUser({}, new UniqueEntityId('user-1'))
    await usersInMemoryRepository.create(user)

    const response = await sut.execute({
      userId: 'user-1',
      companyId: 'inexistent-company-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CompanyNotFound)
  })

  it('not should be able to generate a api key for company if requester is not founder of company', async () => {
    const user = makeUser({}, new UniqueEntityId('user-1'))
    await usersInMemoryRepository.create(user)

    const user2 = makeUser({}, new UniqueEntityId('user-2'))
    await usersInMemoryRepository.create(user2)

    const company = makeCompany(
      {
        founderId: user.id,
      },
      new UniqueEntityId('company-1'),
    )
    await companiesInMemoryRepository.create(company)

    const response = await sut.execute({
      userId: 'user-2',
      companyId: 'company-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CompanyNotFound)
  })

  it('not should be able to generate a api key for company if user already has an api key active', async () => {
    const user = makeUser({}, new UniqueEntityId('user-1'))
    await usersInMemoryRepository.create(user)

    const owner = makeOwner(
      {
        userId: user.id,
        companyId: new UniqueEntityId('company-1'),
      },
      new UniqueEntityId('owner-1'),
    )
    await ownersInMemoryRepository.create(owner)

    const company = makeCompany(
      {
        founderId: user.id,
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
      userId: 'user-1',
      companyId: 'company-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(LotsOfExistingKeys)
  })
})
