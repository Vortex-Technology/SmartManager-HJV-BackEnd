import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { ProductCategoryAlreadyExists } from '../errors/ProductCategoryAlreadyExists'
import { makeProductCategory } from '@test/factories/modules/product/makeProductCategory'
import { CollaboratorsInMemoryRepository } from '@test/repositories/modules/collaborator/CollaboratorsInMemoryRepository'
import { ProductCategoriesInMemoryRepository } from '@test/repositories/modules/product/ProductCategoriesInMemoryRepository'
import { CreateProductCategoryService } from './CreateProductCategory.service'
import { makeManager } from '@test/factories/modules/manager/makeManager'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { makeSeller } from '@test/factories/modules/seller/makeSeller'
import { VerifyPermissionsOfCollaboratorInCompanyService } from '@modules/interceptors/services/VerifyPermissionsOfCollaboratorInCompany.service'
import { VerifyPermissionsOfCollaboratorInMarketService } from '@modules/interceptors/services/VerifyPermissionsOfCollaboratorInMarket.service'
import { CompaniesInMemoryRepository } from '@test/repositories/modules/company/CompaniesInMemoryRepository'
import { MarketsInMemoryRepository } from '@test/repositories/modules/market/MarketsInMemoryRepository'
import { InventoriesInMemoryRepository } from '@test/repositories/modules/inventory/InventoriesInMemoryRepository'
import { ProductVariantInventoriesInMemoryRepository } from '@test/repositories/modules/inventory/ProductVariantInventoriesInMemoryRepository'
import { OwnersInMemoryRepository } from '@test/repositories/modules/owner/OwnersInMemoryRepository'
import { makeCompany } from '@test/factories/modules/company/makeCompany'
import { makeMarket } from '@test/factories/modules/market/makeMarket'

let ownersInMemoryRepository: OwnersInMemoryRepository
let productVariantInventoriesInMemoryRepository: ProductVariantInventoriesInMemoryRepository
let inventoriesInMemoryRepository: InventoriesInMemoryRepository
let marketsInMemoryRepository: MarketsInMemoryRepository
let companiesInMemoryRepository: CompaniesInMemoryRepository
let verifyPermissionsOfCollaboratorInCompanyService: VerifyPermissionsOfCollaboratorInCompanyService
let verifyPermissionsOfCollaboratorInMarketService: VerifyPermissionsOfCollaboratorInMarketService
let collaboratorsInMemoryRepository: CollaboratorsInMemoryRepository
let productCategoriesInMemoryRepository: ProductCategoriesInMemoryRepository

let sut: CreateProductCategoryService

describe('Create product category', () => {
  beforeEach(() => {
    collaboratorsInMemoryRepository = new CollaboratorsInMemoryRepository()

    productCategoriesInMemoryRepository =
      new ProductCategoriesInMemoryRepository()

    productVariantInventoriesInMemoryRepository =
      new ProductVariantInventoriesInMemoryRepository()

    inventoriesInMemoryRepository = new InventoriesInMemoryRepository(
      productVariantInventoriesInMemoryRepository,
    )

    marketsInMemoryRepository = new MarketsInMemoryRepository(
      collaboratorsInMemoryRepository,
      inventoriesInMemoryRepository,
    )
    ownersInMemoryRepository = new OwnersInMemoryRepository(
      collaboratorsInMemoryRepository,
    )

    companiesInMemoryRepository = new CompaniesInMemoryRepository(
      marketsInMemoryRepository,
      ownersInMemoryRepository,
    )

    verifyPermissionsOfCollaboratorInCompanyService =
      new VerifyPermissionsOfCollaboratorInCompanyService(
        collaboratorsInMemoryRepository,
        companiesInMemoryRepository,
      )

    verifyPermissionsOfCollaboratorInMarketService =
      new VerifyPermissionsOfCollaboratorInMarketService(
        verifyPermissionsOfCollaboratorInCompanyService,
        marketsInMemoryRepository,
      )

    sut = new CreateProductCategoryService(
      productCategoriesInMemoryRepository,
      verifyPermissionsOfCollaboratorInMarketService,
    )
  })

  it('should be able to create a new product category', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const market = makeMarket(
      { companyId: company.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const collaborator = makeManager(
      { companyId: company.id, marketId: market.id },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      creatorId: 'manager-1',
      companyId: 'company-1',
      marketId: 'market-1',
      name: 'Product category',
      description: 'A new product category to test the creation',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(
        productCategoriesInMemoryRepository.productCategories,
      ).toHaveLength(1)
      expect(
        productCategoriesInMemoryRepository.productCategories[0].name,
      ).toEqual('product-category')
      expect(
        productCategoriesInMemoryRepository.productCategories[0].description,
      ).toEqual('A new product category to test the creation')
    }
  })

  it("not should be able to create a new product category if collaborator doesn't exist", async () => {
    const response = await sut.execute({
      creatorId: 'inexistent-creator-id',
      companyId: 'company-1',
      marketId: 'market-1',
      name: 'Product category',
      description: 'A new product category to test the creation',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CollaboratorNotFound)
  })

  it("not should be able to create a new product category if collaborator doesn't have necessary role", async () => {
    const collaborator = makeSeller({}, new UniqueEntityId('seller-1'))

    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      creatorId: 'seller-1',
      companyId: 'company-1',
      marketId: 'market-1',
      name: 'Product category',
      description: 'A new product category to test the creation',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it('not should be able to create a new product category if already exist one with same name', async () => {
    const company = makeCompany({}, new UniqueEntityId('company-1'))
    await companiesInMemoryRepository.create(company)

    const market = makeMarket(
      { companyId: company.id },
      new UniqueEntityId('market-1'),
    )
    marketsInMemoryRepository.markets.push(market)

    const collaborator = makeManager(
      { companyId: company.id, marketId: market.id },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(collaborator)

    const productCategory = makeProductCategory({
      name: 'product-category',
    })

    await collaboratorsInMemoryRepository.create(collaborator)
    await productCategoriesInMemoryRepository.create(productCategory)

    const response = await sut.execute({
      creatorId: 'manager-1',
      companyId: 'company-1',
      marketId: 'market-1',
      name: 'Product category',
      description: 'A new product category to test the creation',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ProductCategoryAlreadyExists)
  })
})
