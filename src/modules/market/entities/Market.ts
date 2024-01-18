import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'
import { MarketCollaboratorsList } from './MarketCollaboratorsList'
import { Inventory } from '@modules/inventory/entities/Inventory'

export interface MarketProps {
  tradeName: string
  companyId: UniqueEntityId
  inventoryId: UniqueEntityId
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  postalCode: string
  country: string
  complement: string | null
  collaborators: MarketCollaboratorsList | null
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null

  inventory: Inventory | null
}

export class Market extends AggregateRoot<MarketProps> {
  static create(
    props: Optional<
      MarketProps,
      | 'complement'
      | 'country'
      | 'collaborators'
      | 'createdAt'
      | 'updatedAt'
      | 'deletedAt'
      | 'inventory'
    >,
    id?: UniqueEntityId,
  ) {
    const marketProps: MarketProps = {
      ...props,
      complement: props.complement ?? null,
      country: props.country ?? 'BR',
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

  get street() {
    return this.props.street
  }

  get number() {
    return this.props.number
  }

  get neighborhood() {
    return this.props.neighborhood
  }

  get city() {
    return this.props.city
  }

  get state() {
    return this.props.state
  }

  get postalCode() {
    return this.props.postalCode
  }

  get complement() {
    return this.props.complement
  }

  get country() {
    return this.props.country
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

  touch() {
    this.props.updatedAt = new Date()
  }
}
