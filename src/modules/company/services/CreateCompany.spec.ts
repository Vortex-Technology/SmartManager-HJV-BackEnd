import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { CreateCompanyService } from './CreateCompany.service'
import { UsersInMemoryRepository } from '@test/repositories/modules/user/UsersInMemoryRepository'
import { CompaniesInMemoryRepository } from '@test/repositories/modules/company/CompaniesInMemoryRepository'
import { makeUser } from '@test/factories/modules/user/makeUser'
import { Company } from '../entities/Company'
import { UserNotFount } from '@modules/user/errors/UserNotFound'
import { DocumentationsIsMissing } from '../errors/DocumentationsIsMissing'
import { InsufficientMarkets } from '../errors/InsufficientMarkets'
import { MarketsInMemoryRepository } from '@test/repositories/modules/market/MarketsInMemoryRepository'
import { CollaboratorsInMemoryRepository } from '@test/repositories/modules/collaborator/CollaboratorsInMemoryRepository'
import { InventoriesInMemoryRepository } from '@test/repositories/modules/inventory/InventoriesInMemoryRepository'
import { ProductVariantInventoriesInMemoryRepository } from '@test/repositories/modules/inventory/ProductVariantInventoriesInMemoryRepository'

let usersInMemoryRepository: UsersInMemoryRepository
let productVariantInventoriesInMemoryRepository: ProductVariantInventoriesInMemoryRepository
let inventoriesInMemoryRepository: InventoriesInMemoryRepository
let collaboratorsInMemoryRepository: CollaboratorsInMemoryRepository
let marketsInMemoryRepository: MarketsInMemoryRepository
let companiesInMemoryRepository: CompaniesInMemoryRepository

let sut: CreateCompanyService

describe('Create company', () => {
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

    sut = new CreateCompanyService(
      usersInMemoryRepository,
      companiesInMemoryRepository,
    )
  })

  it('should be able to create a new company', async () => {
    const creator = makeUser({}, new UniqueEntityId('user-1'))
    await usersInMemoryRepository.create(creator)

    const response = await sut.execute({
      companyName: 'Vortex',
      email: 'aLp8y@example.com',
      sector: 'Tech',
      userId: 'user-1',
      startedIssueInvoicesNow: false,
      markets: [
        {
          city: 'São Paulo',
          neighborhood: 'Vila Madalena',
          number: '123',
          postalCode: '12345678',
          state: 'SP',
          street: 'Avenida Brigadeiro Faria Lima',
          tradeName: 'Vortex',
        },
      ],
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.company).toBeInstanceOf(Company)
      expect(companiesInMemoryRepository.companies).toHaveLength(1)
      expect(marketsInMemoryRepository.markets).toHaveLength(1)
      expect(inventoriesInMemoryRepository.inventories).toHaveLength(1)
    }
  })

  it('should be able to create a new company with many markets', async () => {
    const creator = makeUser({}, new UniqueEntityId('user-1'))
    await usersInMemoryRepository.create(creator)

    const response = await sut.execute({
      companyName: 'Vortex',
      email: 'aLp8y@example.com',
      sector: 'Tech',
      userId: 'user-1',
      startedIssueInvoicesNow: false,
      markets: [
        {
          city: 'São Paulo',
          neighborhood: 'Vila Madalena',
          number: '123',
          postalCode: '12345678',
          state: 'SP',
          street: 'Avenida Brigadeiro Faria Lima',
          tradeName: 'Vortex',
        },
        {
          city: 'São Paulo',
          neighborhood: 'Vila Madalena',
          number: '123',
          postalCode: '12345678',
          state: 'SP',
          street: 'Avenida Brigadeiro Faria Lima',
          tradeName: 'Vortex',
        },
        {
          city: 'São Paulo',
          neighborhood: 'Vila Madalena',
          number: '123',
          postalCode: '12345678',
          state: 'SP',
          street: 'Avenida Brigadeiro Faria Lima',
          tradeName: 'Vortex',
        },
      ],
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.company).toBeInstanceOf(Company)
      expect(companiesInMemoryRepository.companies).toHaveLength(1)
      expect(marketsInMemoryRepository.markets).toHaveLength(3)
      expect(inventoriesInMemoryRepository.inventories).toHaveLength(3)
    }
  })

  it('not should be able create a new company if creator not exists', async () => {
    const response = await sut.execute({
      companyName: 'Vortex',
      email: 'aLp8y@example.com',
      sector: 'Tech',
      userId: 'inexistent-user-id',
      startedIssueInvoicesNow: false,
      markets: [
        {
          city: 'São Paulo',
          neighborhood: 'Vila Madalena',
          number: '123',
          postalCode: '12345678',
          state: 'SP',
          street: 'Avenida Brigadeiro Faria Lima',
          tradeName: 'Vortex',
        },
      ],
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(UserNotFount)
    expect(companiesInMemoryRepository.companies).toHaveLength(0)
    expect(marketsInMemoryRepository.markets).toHaveLength(0)
  })

  it('not should be able create a new company if is to start the issue of invoices and user not provide all the documents', async () => {
    const creator = makeUser({}, new UniqueEntityId('user-1'))
    await usersInMemoryRepository.create(creator)

    const response = await sut.execute({
      companyName: 'Vortex',
      email: 'aLp8y@example.com',
      sector: 'Tech',
      userId: 'user-1',
      startedIssueInvoicesNow: true,
      markets: [
        {
          city: 'São Paulo',
          neighborhood: 'Vila Madalena',
          number: '123',
          postalCode: '12345678',
          state: 'SP',
          street: 'Avenida Brigadeiro Faria Lima',
          tradeName: 'Vortex',
        },
      ],
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(DocumentationsIsMissing)
    expect(companiesInMemoryRepository.companies).toHaveLength(0)
    expect(marketsInMemoryRepository.markets).toHaveLength(0)
  })

  it('not should be able create a new company if user not provide at least one market', async () => {
    const creator = makeUser({}, new UniqueEntityId('user-1'))
    await usersInMemoryRepository.create(creator)

    const response = await sut.execute({
      companyName: 'Vortex',
      email: 'aLp8y@example.com',
      sector: 'Tech',
      userId: 'user-1',
      startedIssueInvoicesNow: false,
      markets: [],
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(InsufficientMarkets)
    expect(companiesInMemoryRepository.companies).toHaveLength(0)
    expect(marketsInMemoryRepository.markets).toHaveLength(0)
  })
})
