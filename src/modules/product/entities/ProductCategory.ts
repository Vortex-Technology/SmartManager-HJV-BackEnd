import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'

export interface ProductCategoryProps {
  name: string
  description: string | null
  createdAt: Date
  deletedAt: Date | null
}

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
