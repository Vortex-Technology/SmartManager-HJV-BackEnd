import { CollaboratorsInMemoryRepository } from '@test/repositories/modules/collaborator/CollaboratorsInMemoryRepository'
import { VerifyPermissionsOfCollaboratorInCompanyService } from './VerifyPermissionsOfCollaboratorInCompany.service'
import { CompaniesInMemoryRepository } from '@test/repositories/modules/company/CompaniesInMemoryRepository'
import { MarketsInMemoryRepository } from '@test/repositories/modules/market/MarketsInMemoryRepository'
import { OwnersInMemoryRepository } from '@test/repositories/modules/owner/OwnersInMemoryRepository'
import { InventoriesInMemoryRepository } from '@test/repositories/modules/inventory/InventoriesInMemoryRepository'
import { ProductVariantInventoriesInMemoryRepository } from '@test/repositories/modules/inventory/ProductVariantInventoriesInMemoryRepository'
import { makeCompany } from '@test/factories/modules/company/makeCompany'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { makeOwner } from '@test/factories/modules/owner/makeOwner'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { VerifyPermissionsOfCollaboratorInMarketService } from './VerifyPermissionsOfCollaboratorInMarket.service'
import { makeMarket } from '@test/factories/modules/market/makeMarket'
import { MarketNotFound } from '@modules/market/errors/MarketNorFound'
import { makeSeller } from '@test/factories/modules/seller/makeSeller'
import { PermissionDenied } from '@shared/errors/PermissionDenied'

let productsVariantInventoriesInMemoryRepository: ProductVariantInventoriesInMemoryRepository
let inventoriesInMemoryRepository: InventoriesInMemoryRepository
let marketsInMemoryRepository: MarketsInMemoryRepository
let ownersInMemoryRepository: OwnersInMemoryRepository
let collaboratorsInMemoryRepositor: CollaboratorsInMemoryRepository
let companiesInMemoryRepository: CompaniesInMemoryRepository
let verifyPermissionsOfCollaboratorInCompanyService: VerifyPermissionsOfCollaboratorInCompanyService

let sut: VerifyPermissionsOfCollaboratorInMarketService

describe('Verify permissions of collaborator in market service', async () => {
  beforeEach(async () => {
    collaboratorsInMemoryRepositor = new CollaboratorsInMemoryRepository()

    productsVariantInventoriesInMemoryRepository =
      new ProductVariantInventoriesInMemoryRepository()

    inventoriesInMemoryRepository = new InventoriesInMemoryRepository(
      productsVariantInventoriesInMemoryRepository,
    )

    marketsInMemoryRepository = new MarketsInMemoryRepository(
      collaboratorsInMemoryRepositor,
      inventoriesInMemoryRepository,
    )

    ownersInMemoryRepository = new OwnersInMemoryRepository(
      collaboratorsInMemoryRepositor,
    )

    companiesInMemoryRepository = new CompaniesInMemoryRepository(
      marketsInMemoryRepository,
      ownersInMemoryRepository,
    )

    verifyPermissionsOfCollaboratorInCompanyService =
      new VerifyPermissionsOfCollaboratorInCompanyService(
        collaboratorsInMemoryRepositor,
        companiesInMemoryRepository,
      )

    sut = new VerifyPermissionsOfCollaboratorInMarketService(
      verifyPermissionsOfCollaboratorInCompanyService,
      marketsInMemoryRepository,
    )
  })

  it('should be able to verify permissions of collaborator in market', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const market = makeMarket(
      {
        companyId: company.id,
      },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const owner = makeOwner(
      { companyId: company.id },
      new UniqueEntityId('owner-1'),
    )
    await ownersInMemoryRepository.create(owner)

    const response = await sut.execute({
      acceptedRoles: [CollaboratorRole.OWNER],
      collaboratorId: 'owner-1',
      companyId: 'company-1',
      marketId: 'market-1',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.collaborator.role).toEqual(CollaboratorRole.OWNER)
      expect(response.value.company.id.toString()).toEqual('company-1')
      expect(response.value.collaborator.id.toString()).toEqual('owner-1')
    }
  })

  it('not should be able to verify permissions of collaborator in market if market not exists', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const owner = makeOwner(
      { companyId: company.id },
      new UniqueEntityId('owner-1'),
    )
    await ownersInMemoryRepository.create(owner)

    const response = await sut.execute({
      acceptedRoles: [CollaboratorRole.OWNER],
      collaboratorId: 'owner-1',
      companyId: 'company-1',
      marketId: 'market-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(MarketNotFound)
  })

  it('not should be able to verify permissions of collaborator in market if collaborator have another market id', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const market = makeMarket(
      {
        companyId: company.id,
      },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const market2 = makeMarket(
      {
        companyId: company.id,
      },
      new UniqueEntityId('market-2'),
    )
    marketsInMemoryRepository.markets.push(market2)

    const seller = makeSeller(
      { marketId: market2.id },
      new UniqueEntityId('seller-1'),
    )
    await collaboratorsInMemoryRepositor.create(seller)

    const response = await sut.execute({
      acceptedRoles: [CollaboratorRole.SELLER],
      collaboratorId: 'seller-1',
      companyId: 'company-1',
      marketId: 'market-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it('not should be able to verify permissions of collaborator in market if market are of another company', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const company2 = makeCompany({}, new UniqueEntityId('company-2'))
    await companiesInMemoryRepository.create(company2)

    const market = makeMarket(
      {
        companyId: company2.id,
      },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const owner = makeOwner(
      { companyId: company.id },
      new UniqueEntityId('owner-1'),
    )
    await ownersInMemoryRepository.create(owner)

    const response = await sut.execute({
      acceptedRoles: [CollaboratorRole.OWNER],
      collaboratorId: 'owner-1',
      companyId: 'company-1',
      marketId: 'market-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it('not should be able to verify permissions of collaborator in market if market are of another company', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const company2 = makeCompany({}, new UniqueEntityId('company-2'))
    await companiesInMemoryRepository.create(company2)

    const market = makeMarket(
      {
        companyId: company2.id,
      },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const market2 = makeMarket(
      {
        companyId: company2.id,
      },
      new UniqueEntityId('market-2'),
    )
    marketsInMemoryRepository.markets.push(market2)

    const owner = makeOwner(
      { companyId: company2.id, marketId: market2.id },
      new UniqueEntityId('owner-1'),
    )
    await ownersInMemoryRepository.create(owner)

    const response = await sut.execute({
      acceptedRoles: [CollaboratorRole.OWNER],
      collaboratorId: 'owner-1',
      companyId: 'company-1',
      marketId: 'market-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })
})
