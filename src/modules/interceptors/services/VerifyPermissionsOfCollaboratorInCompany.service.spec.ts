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
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { makeSeller } from '@test/factories/modules/seller/makeSeller'
import { PermissionDenied } from '@shared/errors/PermissionDenied'

let productsVariantInventoriesInMemoryRepository: ProductVariantInventoriesInMemoryRepository
let inventoriesInMemoryRepository: InventoriesInMemoryRepository
let marketsInMemoryRepository: MarketsInMemoryRepository
let ownersInMemoryRepository: OwnersInMemoryRepository
let collaboratorsInMemoryRepositor: CollaboratorsInMemoryRepository
let companiesInMemoryRepository: CompaniesInMemoryRepository

let sut: VerifyPermissionsOfCollaboratorInCompanyService

describe('Verify permissions of collaborator in company service', async () => {
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

    sut = new VerifyPermissionsOfCollaboratorInCompanyService(
      collaboratorsInMemoryRepositor,
      companiesInMemoryRepository,
    )
  })

  it('should be able to verify permissions of collaborator in company', async () => {
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
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.collaborator.role).toEqual(CollaboratorRole.OWNER)
      expect(response.value.company.id.toString()).toEqual('company-1')
      expect(response.value.collaborator.id.toString()).toEqual('owner-1')
    }
  })

  it('not should be able to verify permissions of collaborator in company if company not exist', async () => {
    const owner = makeOwner({}, new UniqueEntityId('owner-1'))
    await ownersInMemoryRepository.create(owner)

    const response = await sut.execute({
      acceptedRoles: [CollaboratorRole.OWNER],
      collaboratorId: 'owner-1',
      companyId: 'inexistent-company-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CompanyNotFound)
  })

  it('not should be able to verify permissions of collaborator in company if collaborator not exists', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const response = await sut.execute({
      acceptedRoles: [CollaboratorRole.OWNER],
      collaboratorId: 'inexistent-owner-id',
      companyId: 'company-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CollaboratorNotFound)
  })

  it('not should be able to verify permissions of collaborator in company if collaborator is not have specified roles', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const seller = makeSeller(
      { companyId: company.id },
      new UniqueEntityId('seller-1'),
    )
    await collaboratorsInMemoryRepositor.create(seller)

    const response = await sut.execute({
      acceptedRoles: [CollaboratorRole.OWNER],
      collaboratorId: 'seller-1',
      companyId: 'company-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it('not should be able to verify permissions of collaborator in company if collaborator have another company id', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const company2 = makeCompany({}, new UniqueEntityId('company-2'))
    await companiesInMemoryRepository.create(company2)

    const owner = makeOwner(
      { companyId: company2.id },
      new UniqueEntityId('owner-1'),
    )
    await ownersInMemoryRepository.create(owner)

    const response = await sut.execute({
      acceptedRoles: [CollaboratorRole.OWNER],
      collaboratorId: 'owner-1',
      companyId: 'company-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })
})
