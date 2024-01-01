import { AdministratorInMemoryRepository } from '@test/repositories/modules/administrator/AdministratorInMemoryRepository'
import { makeAdministrator } from '@test/factories/modules/administrator/makeAdministrator'
import { CreateProductCategoryService } from './createProductCategory.service'
import { ProductCategoryInMemoryRepository } from '@test/repositories/modules/productCategory/ProductCategoryInMemoryRepository'
import { AdministratorRole } from '@modules/administrator/entities/Administrator'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { AdministratorNotFount } from '@modules/administrator/errors/AdministratorNotFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { makeProductCategory } from '@test/factories/modules/productCategory/makeProductCategory'
import { ProductCategoryAlreadyExists } from '../errors/ProductCategoryAlreadyExists'

let administratorInMemoryRepository: AdministratorInMemoryRepository
let productCategoryInMemoryRepository: ProductCategoryInMemoryRepository

let sut: CreateProductCategoryService

describe('Create product category', () => {
  beforeEach(() => {
    administratorInMemoryRepository = new AdministratorInMemoryRepository()
    productCategoryInMemoryRepository = new ProductCategoryInMemoryRepository()

    sut = new CreateProductCategoryService(
      administratorInMemoryRepository,
      productCategoryInMemoryRepository,
    )
  })

  it('should be able to create a new product category', async () => {
    const administrator = makeAdministrator(
      {
        role: AdministratorRole.FULL_ACCESS,
      },
      new UniqueEntityId('1'),
    )

    await administratorInMemoryRepository.create(administrator)

    const response = await sut.execute({
      creatorId: '1',
      name: 'Product category',
      description: 'A new product category to test the creation',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(productCategoryInMemoryRepository.productCategories).toHaveLength(
        1,
      )
      expect(
        productCategoryInMemoryRepository.productCategories[0].name,
      ).toEqual('product-category')
      expect(
        productCategoryInMemoryRepository.productCategories[0].description,
      ).toEqual('A new product category to test the creation')
    }
  })

  it("not should be able to create a new product category if administrator doesn't exist", async () => {
    const response = await sut.execute({
      creatorId: 'inexistent-creator-id',
      name: 'Product category',
      description: 'A new product category to test the creation',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(AdministratorNotFount)
  })

  it("not should be able to create a new product category if administrator doesn't have necessary role", async () => {
    const administrator = makeAdministrator(
      {
        role: AdministratorRole.VIEWER,
      },
      new UniqueEntityId('1'),
    )

    await administratorInMemoryRepository.create(administrator)

    const response = await sut.execute({
      creatorId: '1',
      name: 'Product category',
      description: 'A new product category to test the creation',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it('not should be able to create a new product category if already exist one with same name', async () => {
    const administrator = makeAdministrator(
      {
        role: AdministratorRole.EDITOR,
      },
      new UniqueEntityId('1'),
    )
    const productCategory = makeProductCategory({
      name: 'product-category',
    })

    await administratorInMemoryRepository.create(administrator)
    await productCategoryInMemoryRepository.create(productCategory)

    const response = await sut.execute({
      creatorId: '1',
      name: 'Product category',
      description: 'A new product category to test the creation',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ProductCategoryAlreadyExists)
  })
})
