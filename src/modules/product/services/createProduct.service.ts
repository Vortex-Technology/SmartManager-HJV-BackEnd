import { Either, left, right } from '@shared/core/error/Either'
import { Product, ProductUnitType } from '../entities/Product'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { Injectable } from '@nestjs/common'
import { AdministratorRepository } from '@modules/administrator/repositories/AdministratorRepository'
import { AdministratorNotFount } from '@modules/administrator/errors/AdministratorNotFound'
import { AdministratorRole } from '@modules/administrator/entities/Administrator'
import { ProductCategoriesRepository } from '../repositories/ProductCategoriesRepository'
import { ProductCategory } from '../entities/ProductCategory'
import { ProductCategoriesList } from '../entities/ProductCategoriesList'
import { ProductVariant } from '../entities/ProductVariant'
import { ProductVariantsList } from '../entities/ProductVariantsList'
import { ProductVariantsRepository } from '../repositories/ProductVariantsRepository'
import { ProductVariantAlreadyExistsWithSame } from '../errors/ProductVariantAlreadyExistsWithSame'
import { AllProductVariantAlreadyExists } from '../errors/AllProductVariantAlreadyExists'
import { ProvideAtLeastOneProductVariant } from '../errors/ProvideAlmostOneProductVariant'
import { ProductsRepository } from '../repositories/ProductsRepository'

interface Request {
  creatorId: string
  name: string
  categories?: string[]
  variants: Array<{
    name: string
    description?: string
    model?: string
    pricePerUnit: number
    brand: string
    image?: string
    barCode: string
    unitType: ProductUnitType
  }>
}

type Response = Either<
  | PermissionDenied
  | AdministratorNotFount
  | AllProductVariantAlreadyExists
  | ProvideAtLeastOneProductVariant,
  {
    product: Product
    errors: ProductVariantAlreadyExistsWithSame[]
  }
>

@Injectable()
export class CreateProductService {
  constructor(
    private readonly administratorRepository: AdministratorRepository,
    private readonly productCategoriesRepository: ProductCategoriesRepository,
    private readonly productRepository: ProductsRepository,
    private readonly productsVariantsRepository: ProductVariantsRepository,
  ) {}

  async execute({
    name,
    variants,
    categories = [],
    creatorId,
  }: Request): Promise<Response> {
    const acceptCreateProductForRoles = [
      AdministratorRole.MASTER,
      AdministratorRole.FULL_ACCESS,
      AdministratorRole.EDITOR,
    ]

    if (variants.length < 1) {
      return left(new ProvideAtLeastOneProductVariant())
    }

    const creator = await this.administratorRepository.findById(creatorId)

    if (!creator) {
      return left(new AdministratorNotFount())
    }

    if (!acceptCreateProductForRoles.includes(creator.role)) {
      return left(new PermissionDenied())
    }

    const categoriesExistentsWithNullResults =
      await this.productCategoriesRepository.findByNames(
        categories.map(ProductCategory.normalizeName),
      )

    const indexesOfCategoriesInexistent = categoriesExistentsWithNullResults
      .map((categoriesExistent, index) => (categoriesExistent ? -1 : index))
      .filter((index) => index >= 0)

    const inexistentCategories = indexesOfCategoriesInexistent.map((index) =>
      ProductCategory.create({
        name: categories[index],
      }),
    )

    await this.productCategoriesRepository.createMany(inexistentCategories)

    const categoriesExistents = categoriesExistentsWithNullResults.filter(
      (category) => category !== null,
    ) as Array<ProductCategory>

    const errors: Array<ProductVariantAlreadyExistsWithSame> = []

    const variantsBarCodes = variants.map((variant) => variant.barCode)
    const variantsExistentsWithNullResults =
      await this.productsVariantsRepository.findByBarCodes(variantsBarCodes)

    const variantsExistents = variantsExistentsWithNullResults.filter(
      (variant) => variant !== null,
    ) as Array<ProductVariant>

    if (variantsExistents.length === variants.length) {
      return left(new AllProductVariantAlreadyExists())
    }

    const indexesOfVariantsInexistent = variantsExistentsWithNullResults
      .map((variantExistent, index) => (variantExistent ? -1 : index))
      .filter((index) => index >= 0)

    const inexistentVariants = indexesOfVariantsInexistent.map(
      (index) => variants[index],
    )

    variantsExistents.forEach((variant) =>
      errors.push(
        new ProductVariantAlreadyExistsWithSame(
          `bar code ${variant.barCode}. Name of variant is ${variant.name}`,
        ),
      ),
    )

    const productCategories = new ProductCategoriesList([
      ...categoriesExistents,
      ...inexistentCategories,
    ])

    const product = Product.create({
      name,
      productCategories,
      productVariants: new ProductVariantsList(),
    })

    inexistentVariants.forEach(
      (variant) =>
        product.productVariants?.add(
          ProductVariant.create({
            name: variant.name,
            barCode: variant.barCode,
            brand: variant.brand,
            pricePerUnit: variant.pricePerUnit,
            unitType: variant.unitType,
            description: variant.description,
            image: variant.image,
            model: variant.model,
            productId: product.id,
          }),
        ),
    )

    await this.productRepository.create(product)

    return right({
      product,
      errors,
    })
  }
}
