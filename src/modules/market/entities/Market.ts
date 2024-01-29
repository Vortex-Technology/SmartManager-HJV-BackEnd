import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'
import { MarketCollaboratorsList } from './MarketCollaboratorsList'
import { Inventory } from '@modules/inventory/entities/Inventory'
import { Address } from '@shared/core/valueObjects/Address'
import { z } from 'zod'
import { ZodEntityValidationPipe } from '@shared/pipes/ZodEntityValidation'

const marketPropsSchema = z.object({
  tradeName: z.string().min(3).max(60),
  companyId: z.instanceof(UniqueEntityId),
  inventoryId: z.instanceof(UniqueEntityId),
  collaborators: z.instanceof(MarketCollaboratorsList).nullable(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
  inventory: z
    .custom<Inventory>((v): v is Inventory => v instanceof Inventory)
    .nullable(),
  address: z.custom<Address>((v): v is Address => v instanceof Address),
})

const marketPropsValidationPipe = new ZodEntityValidationPipe(marketPropsSchema)

export type MarketProps = z.infer<typeof marketPropsSchema>

export class Market extends AggregateRoot<MarketProps> {
  static create(
    props: Optional<
      MarketProps,
      'collaborators' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'inventory'
    >,
    id?: UniqueEntityId,
  ) {
    const marketProps: MarketProps = {
      ...props,
      collaborators: props.collaborators ?? null,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? null,
      deletedAt: props.deletedAt ?? null,
      inventory: props.inventory ?? null,
    }

    const market = new Market(marketProps, id)
    market.validate(marketPropsValidationPipe)

    return market
  }

  get tradeName() {
    return this.props.tradeName
  }

  get companyId() {
    return this.props.companyId
  }

  get inventoryId() {
    return this.props.inventoryId
  }

  get collaborators() {
    return this.props.collaborators
  }

  set collaborators(collaborators: MarketCollaboratorsList | null) {
    this.props.collaborators = collaborators
    this.touch()
  }

  get inventory() {
    return this.props.inventory
  }

  get address() {
    return this.props.address
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
