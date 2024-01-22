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
import { Inventory } from '@modules/inventory/entities/Inventory'
import { ProductVariantInventoriesList } from '@modules/inventory/entities/ProductVariantInventoriesList'
import { ProductVariantInventory } from '@modules/inventory/entities/ProductVariantInventory'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { CollaboratorsRepository } from '@modules/collaborator/repositories/CollaboratorsRepository'

interface Request {
  creatorId: string
  name: string
  categories?: string[]
  inventoryId?: string
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
    private readonly collaboratorsRepository: CollaboratorsRepository,
    private readonly productCategoriesRepository: ProductCategoriesRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly productVariantsRepository: ProductVariantsRepository,
    private readonly inventoriesRepository: InventoriesRepository,
  ) {}

  async execute({
    name,
    variants,
    inventoryId,
    categories = [],
    creatorId,
  }: Request): Promise<Response> {
    const acceptCreateProductForRoles = [
      CollaboratorRole.OWNER,
      CollaboratorRole.MANAGER,
      CollaboratorRole.STOCKIST,
    ]

    if (variants.length < 1) {
      return left(new ProvideAtLeastOneProductVariant())
    }

    const creator = await this.collaboratorsRepository.findById(creatorId)
    if (!creator) {
      return left(new CollaboratorNotFound())
    }

    if (!acceptCreateProductForRoles.includes(creator.role)) {
      return left(new PermissionDenied())
    }

    let inventory: Inventory | null = null

    if (inventoryId) {
      inventory = await this.inventoriesRepository.findById(inventoryId)

      if (!inventory) {
        return left(new InventoryNotFount())
      }
    }

    if (!inventory) {
      inventory = Inventory.create({
        name: 'Novo estoque',
        productVariantInventories: new ProductVariantInventoriesList(),
      })
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

    if (!inventory.productVariantInventories) {
      inventory.productVariantInventories = new ProductVariantInventoriesList()
    }

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
        inventoryId: (inventory as Inventory).id,
        productVariantId: newProductVariant.id,
        quantity: variant.quantity,
      })

      product.productVariants?.add(newProductVariant)
      inventory?.productVariantInventories?.add(newProductVariantInventory)
    })

    await this.productsRepository.create(product)

    if (inventoryId) {
      await this.inventoriesRepository.save(inventory)
    } else {
      await this.inventoriesRepository.create(inventory)
    }

    return right({
      product,
      errors,
    })
  }
}
