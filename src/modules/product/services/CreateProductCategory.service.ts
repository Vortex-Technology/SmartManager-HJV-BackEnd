import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { ProductCategory } from '../entities/ProductCategory'
import { ProductCategoriesRepository } from '../repositories/ProductCategoriesRepository'
import { ProductCategoryAlreadyExists } from '../errors/ProductCategoryAlreadyExists'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { VerifyPermissionsOfCollaboratorInMarketService } from '@modules/interceptors/services/VerifyPermissionsOfCollaboratorInMarket.service'

interface Request {
  name: string
  description?: string
  creatorId: string
  companyId: string
  marketId: string
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
    private readonly productCategoriesRepository: ProductCategoriesRepository,
    private readonly verifyPermissions: VerifyPermissionsOfCollaboratorInMarketService,
  ) {}

  async execute({
    creatorId,
    name,
    description,
    companyId,
    marketId,
  }: Request): Promise<Response> {
    const response = await this.verifyPermissions.execute({
      collaboratorId: creatorId,
      companyId,
      marketId,
      acceptedRoles: [
        CollaboratorRole.OWNER,
        CollaboratorRole.MANAGER,
        CollaboratorRole.STOCKIST,
      ],
    })

    if (response.isLeft()) return left(response.value)

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
