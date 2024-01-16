import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { CreateMarketService } from './CreateMarket.service'
import { UsersInMemoryRepository } from '@test/repositories/modules/user/UsersInMemoryRepository'
import { makeUser } from '@test/factories/modules/user/makeUser'
import { Market } from '../entities/Market'
import { UserNotFount } from '@modules/user/errors/UserNotFound'
import { MarketsInMemoryRepository } from '@test/repositories/modules/market/MarketsInMemoryRepository'
import { CompaniesInMemoryRepository } from '@test/repositories/modules/company/CompaniesInMemoryRepository'
import { makeCompany } from '@test/factories/modules/company/makeCompany'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'

let usersInMemoryRepository: UsersInMemoryRepository
let marketsInMemoryRepository: MarketsInMemoryRepository
let companiesInMemoryRepository: CompaniesInMemoryRepository

let sut: CreateMarketService

describe('Create market', () => {
  beforeEach(() => {
    usersInMemoryRepository = new UsersInMemoryRepository()
    marketsInMemoryRepository = new MarketsInMemoryRepository()
    companiesInMemoryRepository = new CompaniesInMemoryRepository(
      marketsInMemoryRepository,
    )

    sut = new CreateMarketService(
      usersInMemoryRepository,
      companiesInMemoryRepository,
    )
  })

  it('should be able to create a new market', async () => {
    const creator = makeUser({}, new UniqueEntityId('user-1'))
    await usersInMemoryRepository.create(creator)

    const company = makeCompany(
      { ownerId: creator.id },
      new UniqueEntityId('company-1'),
    )
    await companiesInMemoryRepository.create(company)

    const response = await sut.execute({
      city: 'São Paulo',
      neighborhood: 'Vila Madalena',
      number: '123',
      postalCode: '12345678',
      state: 'SP',
      street: 'Avenida Brigadeiro Faria Lima',
      tradeName: 'Vortex',
      ownerId: 'user-1',
      companyId: 'company-1',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.market).toBeInstanceOf(Market)
      expect(companiesInMemoryRepository.companies).toHaveLength(1)
      expect(marketsInMemoryRepository.markets).toHaveLength(1)
    }
  })

  it('not should be able create a new market if company not exists', async () => {
    const creator = makeUser({}, new UniqueEntityId('user-1'))
    await usersInMemoryRepository.create(creator)

    const response = await sut.execute({
      city: 'São Paulo',
      neighborhood: 'Vila Madalena',
      number: '123',
      postalCode: '12345678',
      state: 'SP',
      street: 'Avenida Brigadeiro Faria Lima',
      tradeName: 'Vortex',
      companyId: 'inexistent-company-id',
      ownerId: 'user-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CompanyNotFound)
    expect(companiesInMemoryRepository.companies).toHaveLength(0)
    expect(marketsInMemoryRepository.markets).toHaveLength(0)
  })

  it('not should be able create a new market if creator not exists', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const response = await sut.execute({
      city: 'São Paulo',
      neighborhood: 'Vila Madalena',
      number: '123',
      postalCode: '12345678',
      state: 'SP',
      street: 'Avenida Brigadeiro Faria Lima',
      tradeName: 'Vortex',
      companyId: 'company-1',
      ownerId: 'inexistent-user-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(UserNotFount)
    expect(companiesInMemoryRepository.companies).toHaveLength(1)
    expect(marketsInMemoryRepository.markets).toHaveLength(0)
  })

  it('not should be able create a new market if creator not is owner of the company', async () => {
    const creator = makeUser({}, new UniqueEntityId('user-1'))
    await usersInMemoryRepository.create(creator)

    const company = makeCompany(
      { ownerId: new UniqueEntityId('other-user-id') },
      new UniqueEntityId('company-1'),
    )
    await companiesInMemoryRepository.create(company)

    const response = await sut.execute({
      city: 'São Paulo',
      neighborhood: 'Vila Madalena',
      number: '123',
      postalCode: '12345678',
      state: 'SP',
      street: 'Avenida Brigadeiro Faria Lima',
      tradeName: 'Vortex',
      companyId: 'company-1',
      ownerId: 'user-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
    expect(companiesInMemoryRepository.companies).toHaveLength(1)
    expect(marketsInMemoryRepository.markets).toHaveLength(0)
  })
})
