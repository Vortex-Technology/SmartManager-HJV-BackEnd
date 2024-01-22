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

let collaboratorsInMemoryRepository: CollaboratorsInMemoryRepository
let productCategoriesInMemoryRepository: ProductCategoriesInMemoryRepository

let sut: CreateProductCategoryService

describe('Create product category', () => {
  beforeEach(() => {
    collaboratorsInMemoryRepository = new CollaboratorsInMemoryRepository()
    productCategoriesInMemoryRepository =
      new ProductCategoriesInMemoryRepository()

    sut = new CreateProductCategoryService(
      collaboratorsInMemoryRepository,
      productCategoriesInMemoryRepository,
    )
  })

  it('should be able to create a new product category', async () => {
    const collaborator = makeManager({}, new UniqueEntityId('manager-1'))

    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      creatorId: 'manager-1',
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
      name: 'Product category',
      description: 'A new product category to test the creation',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
  })

  it('not should be able to create a new product category if already exist one with same name', async () => {
    const collaborator = makeManager({}, new UniqueEntityId('manager-1'))
    const productCategory = makeProductCategory({
      name: 'product-category',
    })

    await collaboratorsInMemoryRepository.create(collaborator)
    await productCategoriesInMemoryRepository.create(productCategory)

    const response = await sut.execute({
      creatorId: 'manager-1',
      name: 'Product category',
      description: 'A new product category to test the creation',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ProductCategoryAlreadyExists)
  })
})
