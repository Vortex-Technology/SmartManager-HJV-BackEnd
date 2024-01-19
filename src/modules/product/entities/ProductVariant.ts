import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { ProductUnitType } from './Product'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'

export interface ProductVariantProps {
  name: string
  description: string | null
  model: string | null
  pricePerUnit: number
  brand: string
  image: string | null
  barCode: string
  unitType: ProductUnitType
  productId: UniqueEntityId
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}

export class ProductVariant extends AggregateRoot<ProductVariantProps> {
  static create(
    props: Optional<
      ProductVariantProps,
      | 'createdAt'
      | 'updatedAt'
      | 'deletedAt'
      | 'image'
      | 'model'
      | 'description'
    >,
    id?: UniqueEntityId,
  ) {
    const productVariantProps: ProductVariantProps = {
      ...props,
      description: props.description ?? null,
      model: props.model ?? null,
      image: props.image ?? null,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? null,
      deletedAt: props.deletedAt ?? null,
    }

    const productVariant = new ProductVariant(productVariantProps, id)

    return productVariant
  }

  get name() {
    return this.props.name
  }

  get description() {
    return this.props.description
  }

  get model() {
    return this.props.model
  }

  get pricePerUnit() {
    return this.props.pricePerUnit
  }

  get brand() {
    return this.props.brand
  }

  get image() {
    return this.props.image
  }

  get barCode() {
    return this.props.barCode
  }

  get unitType() {
    return this.props.unitType
  }

  get productId() {
    return this.props.productId
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
