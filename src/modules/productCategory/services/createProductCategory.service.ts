import { AdministratorRole } from '@modules/administrator/entities/Administrator'
import { AdministratorNotFount } from '@modules/administrator/errors/AdministratorNotFound'
import { AdministratorRepository } from '@modules/administrator/repositories/AdministratorRepository'
import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { ProductCategory } from '../entities/ProductCategory'
import { ProductCategoriesRepository } from '../repositories/ProductCategoriesRepository'
import { ProductCategoryAlreadyExists } from '../errors/ProductCategoryAlreadyExists'

interface Request {
  name: string
  description?: string
  creatorId: string
}

type Response = Either<
  AdministratorNotFount | ProductCategoryAlreadyExists,
  {
    productCategory: ProductCategory
  }
>

@Injectable()
export class CreateProductCategoryService {
  constructor(
    private readonly administratorRepository: AdministratorRepository,
    private readonly productCategoryRepository: ProductCategoriesRepository,
  ) {}

  async execute({ creatorId, name, description }: Request): Promise<Response> {
    const acceptCreateProductCategoryForRoles = [
      AdministratorRole.MASTER,
      AdministratorRole.FULL_ACCESS,
      AdministratorRole.EDITOR,
    ]

    const creator = await this.administratorRepository.findById(creatorId)

    if (!creator) {
      return left(new AdministratorNotFount())
    }

    if (!acceptCreateProductCategoryForRoles.includes(creator.role)) {
      return left(new PermissionDenied())
    }

    const productCategory = ProductCategory.create({
      name,
      description,
    })

    const productCategoryExists =
      await this.productCategoryRepository.findByName(productCategory.name)

    if (productCategoryExists) {
      return left(new ProductCategoryAlreadyExists())
    }

    await this.productCategoryRepository.create(productCategory)

    return right({
      productCategory,
    })
  }
}
