import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'
import { MarketCollaboratorsList } from './MarketCollaboratorsList'
import { Inventory } from '@modules/inventory/entities/Inventory'
import { Address } from '@shared/core/valueObjects/Address'

export interface MarketProps {
  tradeName: string
  companyId: UniqueEntityId
  inventoryId: UniqueEntityId
  collaborators: MarketCollaboratorsList | null
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null

  inventory: Inventory | null
  address: Address
}

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
