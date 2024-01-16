import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { Company, CompanyDocumentationType } from '../entities/Company'
import { UserNotFount } from '@modules/user/errors/UserNotFound'
import { UsersRepository } from '@modules/user/repositories/UsersRepository'
import { CompaniesRepository } from '../repositories/CompaniesRepository'
import { DocumentationsIsMissing } from '../errors/DocumentationsIsMissing'
import { CompanyMarketsList } from '../entities/CompanyMarketsList'
import { InsufficientMarkets } from '../errors/InsufficientMarkets'
import { Market } from '@modules/market/entities/Market'

interface Request {
  startedIssueInvoicesNow: boolean
  companyName: string
  email: string
  documentation?: string
  documentationType?: CompanyDocumentationType
  stateRegistration?: string
  sector: string
  userId: string
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
  UserNotFount | DocumentationsIsMissing | InsufficientMarkets,
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
    markets,
  }: Request): Promise<Response> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new UserNotFount())
    }

    const hasAllTheDocuments =
      !!documentation && !!documentationType && !!stateRegistration

    if (startedIssueInvoicesNow && !hasAllTheDocuments) {
      return left(new DocumentationsIsMissing())
    }

    if (markets.length === 0) {
      return left(new InsufficientMarkets())
    }

    const company = Company.create({
      companyName,
      ownerId: user.id,
      sector,
      documentation,
      documentationType,
      startedIssueInvoicesAt: startedIssueInvoicesNow ? new Date() : null,
      stateRegistration,
      email,
      markets: new CompanyMarketsList(),
    })

    for (const m of markets) {
      const market = Market.create({
        ...m,
        companyId: company.id,
      })

      company.markets?.add(market)
    }

    await this.companiesRepository.create(company)

    return right({
      company,
    })
  }
}
