import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { ProductVariantsList } from './ProductVariantsList'
import { ProductCategoriesList } from './ProductCategoriesList'
import { Optional } from '@shared/core/types/Optional'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { z } from 'zod'
import { ZodEntityValidationPipe } from '@shared/pipes/ZodEntityValidation'

const productPropsSchema = z.object({
  name: z.string().min(3).max(60),
  productVariants: z.instanceof(ProductVariantsList).nullable(),
  productCategories: z.instanceof(ProductCategoriesList).nullable(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
})

const productValidationPipe = new ZodEntityValidationPipe(productPropsSchema)

export type ProductProps = z.infer<typeof productPropsSchema>

export enum ProductUnitType {
  KILOS = 'KG',
  UNIT = 'UN',
  METERS = 'MT',
  CENTIMETERS = 'CM',
  POL = 'PL',
  LITERS = 'LT',
}

export class Product extends AggregateRoot<ProductProps> {
  static create(
    props: Optional<
      ProductProps,
      | 'createdAt'
      | 'deletedAt'
      | 'updatedAt'
      | 'productCategories'
      | 'productVariants'
    >,
    id?: UniqueEntityId,
  ) {
    const productProps: ProductProps = {
      ...props,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || null,
      deletedAt: props.deletedAt || null,
      productCategories: props.productCategories || null,
      productVariants: props.productVariants || null,
    }

    const product = new Product(productProps, id)
    product.validate(productValidationPipe)

    return product
  }

  get name() {
    return this.props.name
  }

  get productVariants() {
    return this.props.productVariants
  }

  set productVariants(productVariants: ProductVariantsList | null) {
    this.props.productVariants = productVariants
    this.touch()
  }

  get productCategories() {
    return this.props.productCategories
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  get deletedAt() {
    return this.props.deletedAt
  }

  touch() {
    this.props.updatedAt = new Date()
  }
}
