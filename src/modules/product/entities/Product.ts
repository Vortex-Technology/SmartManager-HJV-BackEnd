import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { ProductVariantsList } from './ProductVariantsList'
import { ProductCategoriesList } from './ProductCategoriesList'
import { Optional } from '@shared/core/types/Optional'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

export enum ProductUnitType {
  KILOS = 'KG',
  UNIT = 'UN',
  METERS = 'MT',
  CENTIMETERS = 'CM',
  POL = 'PL',
  LITERS = 'LT',
}

export interface ProductProps {
  name: string

  productVariants: ProductVariantsList | null
  productCategories: ProductCategoriesList | null

  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
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

    return product
  }

  get name() {
    return this.props.name
  }

  get productVariants() {
    return this.props.productVariants
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
