import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { UserNotFound } from '@modules/user/errors/UserNotFound'
import { UsersRepository } from '@modules/user/repositories/UsersRepository'
import { Market } from '@modules/market/entities/Market'
import { CompaniesRepository } from '@modules/company/repositories/CompaniesRepository'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { CompanyMarketsList } from '@modules/company/entities/CompanyMarketsList'
import { Inventory } from '@modules/inventory/entities/Inventory'
import { Address } from '@shared/core/valueObjects/Address'

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

type Response = Either<UserNotFound | CompanyNotFound, { market: Market }>

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
      return left(new UserNotFound())
    }

    if (!company.ownerId.equals(owner.id)) {
      return left(new PermissionDenied())
    }

    const inventory = Inventory.create({
      name: `${tradeName} - Estoque`,
    })

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

    const market = Market.create({
      companyId: company.id,
      tradeName,
      inventoryId: inventory.id,
      inventory,
      address,
    })

    company.markets = new CompanyMarketsList()
    company.markets.add(market)

    await this.companiesRepository.save(company)

    return right({
      market,
    })
  }
}
