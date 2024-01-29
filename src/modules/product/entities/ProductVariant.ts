import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { ProductUnitType } from './Product'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'
import { z } from 'zod'
import { ZodEntityValidationPipe } from '@shared/pipes/ZodEntityValidation'

const productVariantPropsSchema = z.object({
  name: z.string().min(3).max(60),
  description: z.string().max(190).nullable(),
  model: z.string().max(60).nullable(),
  pricePerUnit: z.number().min(1),
  brand: z.string().min(2).max(60),
  image: z.string().url().nullable(),
  barCode: z.string().max(48),
  unitType: z.nativeEnum(ProductUnitType),
  productId: z.instanceof(UniqueEntityId),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
})

const productVariantValidationPipe = new ZodEntityValidationPipe(
  productVariantPropsSchema,
)

export type ProductVariantProps = z.infer<typeof productVariantPropsSchema>

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
    productVariant.validate(productVariantValidationPipe)

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
