import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { UserNotFount } from '@modules/user/errors/UserNotFound'
import { UsersRepository } from '@modules/user/repositories/UsersRepository'
import { Market } from '@modules/market/entities/Market'
import { CompaniesRepository } from '@modules/company/repositories/CompaniesRepository'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { CompanyMarketsList } from '@modules/company/entities/CompanyMarketsList'
import { Inventory } from '@modules/inventory/entities/Inventory'

interface Request {
  tradeName: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  postalCode: string
  country?: string
  complement?: string
  companyId: string
  ownerId: string
}

type Response = Either<UserNotFount | CompanyNotFound, { market: Market }>

@Injectable()
export class CreateMarketService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly companiesRepository: CompaniesRepository,
  ) {}

  async execute({
    city,
    companyId,
    neighborhood,
    number,
    ownerId,
    postalCode,
    state,
    street,
    tradeName,
    complement,
    country,
  }: Request): Promise<Response> {
    const company = await this.companiesRepository.findById(companyId)

    if (!company) {
      return left(new CompanyNotFound())
    }

    const owner = await this.usersRepository.findById(ownerId)

    if (!owner) {
      return left(new UserNotFount())
    }

    if (!company.ownerId.equals(owner.id)) {
      return left(new PermissionDenied())
    }

    const inventory = Inventory.create({
      name: `${tradeName} - Estoque`,
    })

    const market = Market.create({
      city,
      companyId: company.id,
      neighborhood,
      number,
      postalCode,
      state,
      street,
      tradeName,
      complement,
      country,
      inventoryId: inventory.id,
      inventory,
    })

    company.markets = new CompanyMarketsList()
    company.markets.add(market)

    await this.companiesRepository.save(company)

    return right({
      market,
    })
  }
}
