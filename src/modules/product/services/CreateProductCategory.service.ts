import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { ProductCategory } from '../entities/ProductCategory'
import { ProductCategoriesRepository } from '../repositories/ProductCategoriesRepository'
import { ProductCategoryAlreadyExists } from '../errors/ProductCategoryAlreadyExists'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { CollaboratorsRepository } from '@modules/collaborator/repositories/CollaboratorsRepository'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'

interface Request {
  name: string
  description?: string
  creatorId: string
}

type Response = Either<
  CollaboratorNotFound | ProductCategoryAlreadyExists,
  {
    productCategory: ProductCategory
  }
>

@Injectable()
export class CreateProductCategoryService {
  constructor(
    private readonly collaboratorsRepository: CollaboratorsRepository,
    private readonly productCategoriesRepository: ProductCategoriesRepository,
  ) {}

  async execute({ creatorId, name, description }: Request): Promise<Response> {
    const acceptCreateProductCategoryForRoles = [
      CollaboratorRole.OWNER,
      CollaboratorRole.MANAGER,
      CollaboratorRole.STOCKIST,
    ]

    const creator = await this.collaboratorsRepository.findById(creatorId)

    if (!creator) {
      return left(new CollaboratorNotFound())
    }

    if (!acceptCreateProductCategoryForRoles.includes(creator.role)) {
      return left(new PermissionDenied())
    }

    const productCategory = ProductCategory.create({
      name,
      description,
    })

    const productCategoryExists =
      await this.productCategoriesRepository.findByName(productCategory.name)

    if (productCategoryExists) {
      return left(new ProductCategoryAlreadyExists())
    }

    await this.productCategoriesRepository.create(productCategory)

    return right({
      productCategory,
    })
  }
}
