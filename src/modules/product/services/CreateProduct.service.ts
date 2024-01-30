import { Either, left, right } from '@shared/core/error/Either'
import { Product, ProductUnitType } from '../entities/Product'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { Injectable } from '@nestjs/common'
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
import { InventoriesRepository } from '@modules/inventory/repositories/InventoriesRepository'
import { InventoryNotFount } from '@modules/inventory/errors/InventoryNotFound'
import { ProductVariantInventoriesList } from '@modules/inventory/entities/ProductVariantInventoriesList'
import { ProductVariantInventory } from '@modules/inventory/entities/ProductVariantInventory'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { TransactorService } from '@infra/database/transactor/contracts/TransactorService'
import { VerifyPermissionsOfCollaboratorInMarketService } from '@modules/interceptors/services/VerifyPermissionsOfCollaboratorInMarket.service'

interface Request {
  creatorId: string
  inventoryId: string
  companyId: string
  marketId: string
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
    quantity: number
  }>
}

type Response = Either<
  | PermissionDenied
  | AllProductVariantAlreadyExists
  | ProvideAtLeastOneProductVariant
  | InventoryNotFount
  | CollaboratorNotFound,
  {
    product: Product
    errors: ProductVariantAlreadyExistsWithSame[]
  }
>

@Injectable()
export class CreateProductService {
  constructor(
    private readonly productCategoriesRepository: ProductCategoriesRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly productVariantsRepository: ProductVariantsRepository,
    private readonly inventoriesRepository: InventoriesRepository,
    private readonly transactorService: TransactorService,
    private readonly verifyPermissions: VerifyPermissionsOfCollaboratorInMarketService,
  ) {}

  async execute({
    name,
    variants,
    inventoryId,
    categories = [],
    creatorId,
    companyId,
    marketId,
  }: Request): Promise<Response> {
    if (variants.length < 1) {
      return left(new ProvideAtLeastOneProductVariant())
    }

    const response = await this.verifyPermissions.execute({
      acceptedRoles: [
        CollaboratorRole.OWNER,
        CollaboratorRole.MANAGER,
        CollaboratorRole.STOCKIST,
      ],
      collaboratorId: creatorId,
      companyId,
      marketId,
    })

    if (response.isLeft()) return left(response.value)

    const inventory = await this.inventoriesRepository.findById(inventoryId)
    if (!inventory) {
      return left(new InventoryNotFount())
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

    const transaction = this.transactorService.start()

    transaction.add((ex) =>
      this.productCategoriesRepository.createMany(inexistentCategories, ex),
    )

    const categoriesExistents = categoriesExistentsWithNullResults.filter(
      (category) => category !== null,
    ) as Array<ProductCategory>

    const errors: Array<ProductVariantAlreadyExistsWithSame> = []

    const variantsBarCodes = variants.map((variant) => variant.barCode)
    const variantsExistentsWithNullResults =
      await this.productVariantsRepository.findByBarCodes(variantsBarCodes)

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

    inventory.productVariantInventories = new ProductVariantInventoriesList()

    const product = Product.create({
      name,
      productCategories,
      productVariants: new ProductVariantsList(),
    })

    inexistentVariants.forEach((variant) => {
      const newProductVariant = ProductVariant.create({
        name: variant.name,
        barCode: variant.barCode,
        brand: variant.brand,
        pricePerUnit: variant.pricePerUnit,
        unitType: variant.unitType,
        description: variant.description,
        image: variant.image,
        model: variant.model,
        productId: product.id,
      })

      const newProductVariantInventory = ProductVariantInventory.create({
        inventoryId: inventory.id,
        productVariantId: newProductVariant.id,
        quantity: variant.quantity,
      })

      product.productVariants?.add(newProductVariant)
      inventory?.productVariantInventories?.add(newProductVariantInventory)
    })

    transaction.add((ex) => this.productsRepository.create(product, ex))
    transaction.add((ex) => this.inventoriesRepository.save(inventory, ex))

    await this.transactorService.execute(transaction)

    return right({
      product,
      errors,
    })
  }
}
