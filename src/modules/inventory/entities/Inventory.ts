import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'
import { ProductVariantInventoriesList } from './ProductVariantInventoriesList'
import { z } from 'zod'
import { ZodEntityValidationPipe } from '@shared/pipes/ZodEntityValidation'

const inventoryPropsSchema = z.object({
  name: z.string().min(3).max(60),
  companyId: z.instanceof(UniqueEntityId),
  productVariantInventories: z
    .instanceof(ProductVariantInventoriesList)
    .nullable(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
})

const inventoryValidationPipe = new ZodEntityValidationPipe(
  inventoryPropsSchema,
)

export type InventoryProps = z.infer<typeof inventoryPropsSchema>

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
    inventory.validate(inventoryValidationPipe)

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
    this.touch()
  }

  get companyId() {
    return this.props.companyId
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
