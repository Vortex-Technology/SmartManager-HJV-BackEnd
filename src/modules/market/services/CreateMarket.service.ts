import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { Market } from '@modules/market/entities/Market'
import { CompaniesRepository } from '@modules/company/repositories/CompaniesRepository'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { CompanyMarketsList } from '@modules/company/entities/CompanyMarketsList'
import { Inventory } from '@modules/inventory/entities/Inventory'
import { Address } from '@shared/core/valueObjects/Address'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { CollaboratorsRepository } from '@modules/collaborator/repositories/CollaboratorsRepository'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'

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
  creatorId: string
}

type Response = Either<
  CollaboratorNotFound | CompanyNotFound | PermissionDenied,
  { market: Market }
>

@Injectable()
export class CreateMarketService {
  constructor(
    private readonly collaboratorsRepository: CollaboratorsRepository,
    private readonly companiesRepository: CompaniesRepository,
  ) {}

  async execute({
    city,
    companyId,
    neighborhood,
    number,
    creatorId,
    postalCode,
    state,
    street,
    tradeName,
    complement,
    country,
  }: Request): Promise<Response> {
    const acceptCreationForRoles = [
      CollaboratorRole.MANAGER,
      CollaboratorRole.OWNER,
    ]

    const creator = await this.collaboratorsRepository.findById(creatorId)
    if (!creator) {
      return left(new CollaboratorNotFound())
    }

    const company = await this.companiesRepository.findById(companyId)
    if (!company) {
      return left(new CompanyNotFound())
    }

    if (!acceptCreationForRoles.includes(creator.role)) {
      return left(new PermissionDenied())
    }

    if (!creator.companyId?.equals(company.id)) {
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
