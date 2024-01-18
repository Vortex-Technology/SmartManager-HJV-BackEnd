import { ProductUnitType } from '@modules/product/entities/Product'
import { ProductVariant } from '@modules/product/entities/ProductVariant'
import {
  Prisma,
  ProductVariant as ProductVariantPrisma,
  UnitType,
} from '@prisma/client'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export class ProductVariantsPrismaMapper {
  static toEntity(raw: ProductVariantPrisma): ProductVariant {
    const unitTypeMapper = {
      [UnitType.CM]: ProductUnitType.CENTIMETERS,
      [UnitType.KG]: ProductUnitType.KILOS,
      [UnitType.LT]: ProductUnitType.LITERS,
      [UnitType.MT]: ProductUnitType.METERS,
      [UnitType.PL]: ProductUnitType.POL,
      [UnitType.UN]: ProductUnitType.UNIT,
    } as const

    return ProductVariant.create(
      {
        name: raw.name,
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
        description: raw.description,
        barCode: raw.barCode,
        brand: raw.brand,
        pricePerUnit: raw.pricePerUnit,
        productId: new UniqueEntityId(raw.productId),
        unitType: unitTypeMapper[raw.unitType],
        image: raw.image,
        model: raw.model,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(
    productVariant: ProductVariant,
  ): Prisma.ProductVariantUncheckedCreateInput {
    const unitTypeMapper = {
      [ProductUnitType.CENTIMETERS]: UnitType.CM,
      [ProductUnitType.KILOS]: UnitType.KG,
      [ProductUnitType.LITERS]: UnitType.LT,
      [ProductUnitType.METERS]: UnitType.MT,
      [ProductUnitType.POL]: UnitType.PL,
      [ProductUnitType.UNIT]: UnitType.UN,
    } as const

    return {
      id: productVariant.id.toString(),
      barCode: productVariant.barCode,
      brand: productVariant.brand,
      pricePerUnit: productVariant.pricePerUnit,
      productId: productVariant.productId.toString(),
      unitType: unitTypeMapper[productVariant.unitType],
      name: productVariant.name,
      createdAt: productVariant.createdAt,
      deletedAt: productVariant.deletedAt,
      description: productVariant.description,
      image: productVariant.image,
      model: productVariant.model,
      updatedAt: productVariant.updatedAt,
    }
  }
}
