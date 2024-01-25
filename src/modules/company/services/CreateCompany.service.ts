import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { Company, CompanyDocumentationType } from '../entities/Company'
import { UsersRepository } from '@modules/user/repositories/UsersRepository'
import { CompaniesRepository } from '../repositories/CompaniesRepository'
import { DocumentationsIsMissing } from '../errors/DocumentationsIsMissing'
import { CompanyMarketsList } from '../entities/CompanyMarketsList'
import { InsufficientMarkets } from '../errors/InsufficientMarkets'
import { Market } from '@modules/market/entities/Market'
import { Inventory } from '@modules/inventory/entities/Inventory'
import { Owner } from '@modules/owner/entities/Owner'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { Address } from '@shared/core/valueObjects/Address'
import { UserNotFound } from '@modules/user/errors/UserNotFound'

interface Request {
  startedIssueInvoicesNow: boolean
  companyName: string
  email: string
  documentation?: string
  documentationType?: CompanyDocumentationType
  stateRegistration?: string
  sector: string
  userId: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  postalCode: string
  country?: string
  complement?: string
  markets: Array<{
    tradeName: string
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    postalCode: string
    country?: string
    complement?: string
  }>
}

type Response = Either<
  UserNotFound | DocumentationsIsMissing | InsufficientMarkets,
  { company: Company }
>

@Injectable()
export class CreateCompanyService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly companiesRepository: CompaniesRepository,
  ) {}

  async execute({
    companyName,
    email,
    sector,
    userId,
    documentation,
    documentationType,
    startedIssueInvoicesNow,
    stateRegistration,
    city,
    neighborhood,
    number,
    postalCode,
    state,
    street,
    complement,
    country,
    markets,
  }: Request): Promise<Response> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new UserNotFound())
    }

    const hasAllTheDocuments =
      !!documentation && !!documentationType && !!stateRegistration

    if (startedIssueInvoicesNow && !hasAllTheDocuments) {
      return left(new DocumentationsIsMissing())
    }

    if (markets.length === 0) {
      return left(new InsufficientMarkets())
    }

    const ownerId = new UniqueEntityId()
    const companyId = new UniqueEntityId()

    const owner = Owner.create(
      {
        actualRemuneration: 0,
        email: user.email,
        password: user.password,
        userId: user.id,
        companyId,
      },
      ownerId,
    )

    const address = Address.create({
      city,
      neighborhood,
      number,
      postalCode,
      state,
      street,
      complement,
      country,
    })

    const company = Company.create(
      {
        companyName,
        founderId: user.id,
        sector,
        documentation,
        documentationType,
        startedIssueInvoicesAt: startedIssueInvoicesNow ? new Date() : null,
        stateRegistration,
        email,
        markets: new CompanyMarketsList(),
        ownerId,
        owner,
        address,
      },
      companyId,
    )

    for (const m of markets) {
      const inventory = Inventory.create({
        companyId: company.id,
        name: m.tradeName,
      })

      const marketAddress = Address.create({
        city: m.city,
        neighborhood: m.neighborhood,
        number: m.number,
        postalCode: m.postalCode,
        state: m.state,
        street: m.street,
        complement: m.complement,
        country: m.country,
      })

      const market = Market.create({
        tradeName: m.tradeName,
        companyId: company.id,
        inventoryId: inventory.id,
        inventory,
        address: marketAddress,
      })

      company.markets?.add(market)
    }

    await this.companiesRepository.create(company)

    return right({
      company,
    })
  }
}
