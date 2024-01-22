import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'
import { CompanyMarketsList } from './CompanyMarketsList'
import { Owner } from '@modules/owner/entities/Owner'
import { Address } from '@shared/core/valueObjects/Address'

export enum CompanyDocumentationType {
  IE = 'IE', // individual person
  LE = 'LE', // legal person
}

export enum CompanyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface CompanyProps {
  email: string | null
  status: CompanyStatus
  companyName: string
  documentation: string | null
  documentationType: CompanyDocumentationType | null
  stateRegistration: string | null
  sector: string
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
  startedIssueInvoicesAt: Date | null
  markets: CompanyMarketsList | null
  founderId: UniqueEntityId
  ownerId: UniqueEntityId
  owner: Owner | null
  address: Address
}

export class Company extends AggregateRoot<CompanyProps> {
  static create(
    props: Optional<
      CompanyProps,
      | 'email'
      | 'documentation'
      | 'documentationType'
      | 'stateRegistration'
      | 'createdAt'
      | 'updatedAt'
      | 'deletedAt'
      | 'startedIssueInvoicesAt'
      | 'markets'
      | 'status'
      | 'owner'
    >,
    id?: UniqueEntityId,
  ) {
    const companyProps: CompanyProps = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? null,
      deletedAt: props.deletedAt ?? null,
      startedIssueInvoicesAt: props.startedIssueInvoicesAt ?? null,
      email: props.email ?? null,
      documentation: props.documentation ?? null,
      documentationType: props.documentationType ?? null,
      stateRegistration: props.stateRegistration ?? null,
      markets: props.markets ?? null,
      status: props.status ?? CompanyStatus.INACTIVE,
      owner: props.owner ?? null,
    }

    const company = new Company(companyProps, id)

    return company
  }

  get email() {
    return this.props.email
  }

  get status() {
    return this.props.status
  }

  get companyName() {
    return this.props.companyName
  }

  get documentation() {
    return this.props.documentation
  }

  get documentationType() {
    return this.props.documentationType
  }

  get stateRegistration() {
    return this.props.stateRegistration
  }

  get sector() {
    return this.props.sector
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

  get startedIssueInvoicesAt() {
    return this.props.startedIssueInvoicesAt
  }

  get founderId() {
    return this.props.founderId
  }

  get ownerId() {
    return this.props.ownerId
  }

  get markets() {
    return this.props.markets
  }

  set markets(markets: CompanyMarketsList | null) {
    this.props.markets = markets
    this.touch()
  }

  get owner() {
    return this.props.owner
  }

  get address() {
    return this.props.address
  }

  touch() {
    this.props.updatedAt = new Date()
  }
}
