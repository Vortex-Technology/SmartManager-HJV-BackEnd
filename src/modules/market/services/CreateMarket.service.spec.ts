import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { CreateMarketService } from './CreateMarket.service'
import { Market } from '../entities/Market'
import { MarketsInMemoryRepository } from '@test/repositories/modules/market/MarketsInMemoryRepository'
import { CompaniesInMemoryRepository } from '@test/repositories/modules/company/CompaniesInMemoryRepository'
import { makeCompany } from '@test/factories/modules/company/makeCompany'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { CollaboratorsInMemoryRepository } from '@test/repositories/modules/collaborator/CollaboratorsInMemoryRepository'
import { InventoriesInMemoryRepository } from '@test/repositories/modules/inventory/InventoriesInMemoryRepository'
import { ProductVariantInventoriesInMemoryRepository } from '@test/repositories/modules/inventory/ProductVariantInventoriesInMemoryRepository'
import { makeManager } from '@test/factories/modules/manager/makeManager'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { makeOwner } from '@test/factories/modules/owner/makeOwner'
import { OwnersInMemoryRepository } from '@test/repositories/modules/owner/OwnersInMemoryRepository'

let productVariantInventoriesInMemoryRepository: ProductVariantInventoriesInMemoryRepository
let inventoriesInMemoryRepository: InventoriesInMemoryRepository
let collaboratorsInMemoryRepository: CollaboratorsInMemoryRepository
let marketsInMemoryRepository: MarketsInMemoryRepository
let companiesInMemoryRepository: CompaniesInMemoryRepository
let ownersInMemoryRepository: OwnersInMemoryRepository

let sut: CreateMarketService

describe('Create market', () => {
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

    sut = new CreateMarketService(
      collaboratorsInMemoryRepository,
      companiesInMemoryRepository,
    )
  })

  it('should be able to create a new market', async () => {
    const creator = makeOwner(
      {
        companyId: new UniqueEntityId('company-1'),
      },
      new UniqueEntityId('owner-1'),
    )

    const company = makeCompany(
      { ownerId: creator.id, owner: creator },
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
      creatorId: 'owner-1',
      companyId: 'company-1',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.market).toBeInstanceOf(Market)
      expect(companiesInMemoryRepository.companies).toHaveLength(1)
      expect(marketsInMemoryRepository.markets).toHaveLength(1)
      expect(inventoriesInMemoryRepository.inventories).toHaveLength(1)
    }
  })

  it('not should be able create a new market if company not exists', async () => {
    const creator = makeManager({}, new UniqueEntityId('manager-1'))
    await collaboratorsInMemoryRepository.create(creator)

    const response = await sut.execute({
      city: 'São Paulo',
      neighborhood: 'Vila Madalena',
      number: '123',
      postalCode: '12345678',
      state: 'SP',
      street: 'Avenida Brigadeiro Faria Lima',
      tradeName: 'Vortex',
      companyId: 'inexistent-company-id',
      creatorId: 'manager-1',
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
      creatorId: 'inexistent-manager-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CollaboratorNotFound)
    expect(companiesInMemoryRepository.companies).toHaveLength(1)
    expect(marketsInMemoryRepository.markets).toHaveLength(0)
  })

  it('not should be able create a new market if creator not is creator of the company', async () => {
    const creator = makeManager({}, new UniqueEntityId('manager-1'))
    await collaboratorsInMemoryRepository.create(creator)

    const otherOwner = makeOwner()

    const company = makeCompany(
      { ownerId: otherOwner.id, owner: otherOwner },
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
      creatorId: 'manager-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
    expect(companiesInMemoryRepository.companies).toHaveLength(1)
    expect(marketsInMemoryRepository.markets).toHaveLength(0)
  })
})
