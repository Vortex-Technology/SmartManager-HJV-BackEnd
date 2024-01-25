import { fakerPT_BR } from '@faker-js/faker'
import { CompaniesPrismaMapper } from '@infra/database/prisma/company/CompaniesPrismaMapper'
import { PrismaService } from '@infra/database/prisma/index.service'
import {
  Company,
  CompanyProps,
  CompanyStatus,
} from '@modules/company/entities/Company'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { makeAddress } from '@test/factories/valueObjects/address/makeAddress'

export function makeCompany(
  override: Partial<CompanyProps> = {},
  id?: UniqueEntityId,
): Company {
  const company = Company.create(
    {
      address: makeAddress(),
      companyName: fakerPT_BR.company.name(),
      ownerId: new UniqueEntityId(),
      sector: 'IT',
      status: CompanyStatus.ACTIVE,
      founderId: new UniqueEntityId(),
      ...override,
    },
    id,
  )

  return company
}

@Injectable()
export class MakeCompany {
  constructor(private readonly prisma: PrismaService) {}

  async create(override: Partial<CompanyProps> = {}, id?: UniqueEntityId) {
    const company = makeCompany(override, id)

    await this.prisma.company.create({
      data: CompaniesPrismaMapper.toCreatePrisma(company),
    })

    return company
  }
}
