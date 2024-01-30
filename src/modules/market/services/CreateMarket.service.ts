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
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { VerifyPermissionsOfCollaboratorInCompanyService } from '@modules/interceptors/services/VerifyPermissionsOfCollaboratorInCompany.service'

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
    private readonly companiesRepository: CompaniesRepository,
    private readonly verifyPermissions: VerifyPermissionsOfCollaboratorInCompanyService,
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
    const response = await this.verifyPermissions.execute({
      acceptedRoles: [CollaboratorRole.MANAGER, CollaboratorRole.OWNER],
      collaboratorId: creatorId,
      companyId,
    })

    if (response.isLeft()) return left(response.value)

    const { company } = response.value

    const inventory = Inventory.create({
      companyId: company.id,
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
