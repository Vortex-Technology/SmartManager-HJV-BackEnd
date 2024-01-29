import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'
import { z } from 'zod'
import { ZodEntityValidationPipe } from '@shared/pipes/ZodEntityValidation'

const productCategoryPropsSchema = z.object({
  name: z.string().min(3).max(60),
  description: z.string().max(190).nullable(),
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
})

const productCategoryValidationPipe = new ZodEntityValidationPipe(
  productCategoryPropsSchema,
)

export type ProductCategoryProps = z.infer<typeof productCategoryPropsSchema>

export class ProductCategory extends AggregateRoot<ProductCategoryProps> {
  static create(
    props: Optional<
      ProductCategoryProps,
      'createdAt' | 'deletedAt' | 'description'
    >,
    id?: UniqueEntityId,
  ) {
    const productCategoryProps: ProductCategoryProps = {
      name: ProductCategory.normalizeName(props.name),
      createdAt: props.createdAt ?? new Date(),
      deletedAt: props.deletedAt ?? null,
      description: props.description ?? null,
    }

    const productCategory = new ProductCategory(productCategoryProps, id)
    productCategory.validate(productCategoryValidationPipe)

    return productCategory
  }

  static normalizeName(name: string) {
    return name
      .toLowerCase()
      .replaceAll(' ', '-')
      .replace(/[^\w\s-]/gi, '')
  }

  get name() {
    return this.props.name
  }

  get description() {
    return this.props.description
  }

  get createdAt() {
    return this.props.createdAt
  }

  get deletedAt() {
    return this.props.deletedAt
  }
}
