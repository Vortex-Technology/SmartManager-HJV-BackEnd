import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'
import { ProductVariantInventoriesList } from './ProductVariantInventoriesList'

export interface InventoryProps {
  name: string
  productVariantInventories: ProductVariantInventoriesList | null
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}

export class Inventory extends AggregateRoot<InventoryProps> {
  static create(
    props: Optional<
      InventoryProps,
      'createdAt' | 'deletedAt' | 'updatedAt' | 'productVariantInventories'
    >,
    id?: UniqueEntityId,
  ) {
    const inventoryProps: InventoryProps = {
      ...props,
      productVariantInventories: props.productVariantInventories ?? null,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? null,
      deletedAt: props.deletedAt ?? null,
    }

    const inventory = new Inventory(inventoryProps, id)

    return inventory
  }

  get name() {
    return this.props.name
  }

  get productVariantInventories() {
    return this.props.productVariantInventories
  }

  set productVariantInventories(
    productVariantInventories: ProductVariantInventoriesList | null,
  ) {
    this.props.productVariantInventories = productVariantInventories
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
