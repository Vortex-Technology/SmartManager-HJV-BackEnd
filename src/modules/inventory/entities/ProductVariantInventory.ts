import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'

export interface ProductVariantInventoryProps {
  quantity: number
  productVariantId: UniqueEntityId
  inventoryId: UniqueEntityId
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}

export class ProductVariantInventory extends AggregateRoot<ProductVariantInventoryProps> {
  static create(
    props: Optional<
      ProductVariantInventoryProps,
      'createdAt' | 'deletedAt' | 'updatedAt'
    >,
    id?: UniqueEntityId,
  ) {
    const productVariantInventoryProps: ProductVariantInventoryProps = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? null,
      deletedAt: props.deletedAt ?? null,
    }

    const productVariantInventory = new ProductVariantInventory(
      productVariantInventoryProps,
      id,
    )

    return productVariantInventory
  }

  get quantity() {
    return this.props.quantity
  }

  get productVariantId() {
    return this.props.productVariantId
  }

  get inventoryId() {
    return this.props.inventoryId
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
