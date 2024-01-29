import { Either, left, right } from '@shared/core/error/Either'
import { ProductUnitType } from '../entities/Product'
import { Injectable } from '@nestjs/common'
import { VerifyPermissionsOfCollaboratorInMarketService } from '@modules/interceptors/services/VerifyPermissionsOfCollaboratorInMarket.service'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { ProductVariant } from '../entities/ProductVariant'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { MarketNotFound } from '@modules/market/errors/MarketNorFound'
import { ProductNotFound } from '../errors/ProductNotFound'
import { ProductsRepository } from '../repositories/ProductsRepository'
import { ProductVariantsRepository } from '../repositories/ProductVariantsRepository'
import { ProductVariantAlreadyExistsWithSame } from '../errors/ProductVariantAlreadyExistsWithSame'
import { ProductVariantsList } from '../entities/ProductVariantsList'
import { QuantityMustBeGreaterThanZero } from '../errors/QuantityMustBeGreaterThanZero'
import { TransactorService } from '@infra/database/transactor/contracts/TransactorService'
import { InventoryNotFount } from '@modules/inventory/errors/InventoryNotFound'
import { InventoriesRepository } from '@modules/inventory/repositories/InventoriesRepository'
import { ProductVariantInventory } from '@modules/inventory/entities/ProductVariantInventory'
import { ProductVariantInventoriesList } from '@modules/inventory/entities/ProductVariantInventoriesList'

interface Request {
  collaboratorId: string
  companyId: string
  marketId: string
  inventoryId: string
  productId: string
  name: string
  description?: string
  model?: string
  pricePerUnit: number
  brand: string
  image?: string
  barCode: string
  unitType: ProductUnitType
  quantity: number
}

type Response = Either<
  | CollaboratorNotFound
  | CompanyNotFound
  | PermissionDenied
  | MarketNotFound
  | ProductNotFound
  | InventoryNotFount
  | ProductVariantAlreadyExistsWithSame
  | QuantityMustBeGreaterThanZero,
  {
    productVariant: ProductVariant
  }
>

@Injectable()
export class CreateProductVariantService {
  constructor(
    private readonly transactorService: TransactorService,
    private readonly verifyPermissions: VerifyPermissionsOfCollaboratorInMarketService,
    private readonly productsRepository: ProductsRepository,
    private readonly productVariantsRepository: ProductVariantsRepository,
    private readonly inventoriesRepository: InventoriesRepository,
  ) {}

  async execute({
    barCode,
    brand,
    collaboratorId,
    companyId,
    marketId,
    name,
    pricePerUnit,
    productId,
    quantity,
    unitType,
    description,
    image,
    model,
    inventoryId,
  }: Request): Promise<Response> {
    const response = await this.verifyPermissions.execute({
      acceptedRoles: [
        CollaboratorRole.MANAGER,
        CollaboratorRole.OWNER,
        CollaboratorRole.STOCKIST,
      ],
      companyId,
      marketId,
      collaboratorId,
    })

    if (response.isLeft()) return left(response.value)

    const product = await this.productsRepository.findById(productId)
    if (!product) {
      return left(new ProductNotFound())
    }

    const productVariantExists =
      await this.productVariantsRepository.findByBarCode(barCode)
    if (productVariantExists) {
      return left(
        new ProductVariantAlreadyExistsWithSame(
          `bar code ${productVariantExists.barCode}. Name of variant is ${productVariantExists.name}`,
        ),
      )
    }

    const inventory = await this.inventoriesRepository.findById(inventoryId)
    if (!inventory) {
      return left(new InventoryNotFount())
    }

    const transaction = this.transactorService.start()

    const productVariant = ProductVariant.create({
      name,
      description,
      model,
      pricePerUnit,
      brand,
      image,
      barCode,
      unitType,
      productId: product.id,
    })

    const productVariantInventory = ProductVariantInventory.create({
      quantity,
      productVariantId: productVariant.id,
      inventoryId: inventory.id,
    })

    product.productVariants = new ProductVariantsList()
    inventory.productVariantInventories = new ProductVariantInventoriesList()

    product.productVariants.add(productVariant)
    inventory.productVariantInventories.add(productVariantInventory)

    transaction.add((ex) => this.productsRepository.save(product, ex))
    transaction.add((ex) => this.inventoriesRepository.save(inventory, ex))

    await this.transactorService.execute(transaction)

    return right({
      productVariant,
    })
  }
}
