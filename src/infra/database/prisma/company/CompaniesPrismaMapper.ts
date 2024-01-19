import {
  Company,
  CompanyDocumentationType,
  CompanyStatus,
} from '@modules/company/entities/Company'
import {
  Company as CompanyPrisma,
  Prisma,
  Address as AddressPrisma,
} from '@prisma/client'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { AddressesPrismaMapper } from '../address/AddressesPrismaMapper'
import { CollaboratorsPrismaMapper } from '../collaborator/CollaboratorsPrismaMapper'

type CompanyWithAddressAndOwnerIdPrisma = CompanyPrisma & {
  address: AddressPrisma
  owner: {
    id: string
  } | null
}

export class CompaniesPrismaMapper {
  static toEntity(raw: CompanyWithAddressAndOwnerIdPrisma): Company {
    if (!raw.owner?.id) {
      throw new Error('Owner not exist in company')
    }

    return Company.create(
      {
        companyName: raw.companyNane,
        founderId: new UniqueEntityId(raw.founderId),
        ownerId: new UniqueEntityId(raw.owner.id),
        sector: raw.sector,
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
        documentation: raw.documentation,
        documentationType: raw.documentationType as CompanyDocumentationType,
        email: raw.email,
        startedIssueInvoicesAt: raw.startedIssueInvoicesAt,
        stateRegistration: raw.stateRegistration,
        status: raw.status as CompanyStatus,
        updatedAt: raw.updatedAt,
        address: AddressesPrismaMapper.toEntity(raw.address),
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toCreatePrisma(company: Company): Prisma.CompanyCreateInput {
    if (!company.owner) {
      throw new Error('Owner not set in creation of company')
    }

    return {
      companyNane: company.companyName,
      founder: {
        connect: {
          id: company.founderId.toString(),
        },
      },
      address: {
        create: AddressesPrismaMapper.toPrisma(company.address),
      },
      owner: {
        create: CollaboratorsPrismaMapper.toPrisma(company.owner),
      },
      sector: company.sector,
      createdAt: company.createdAt,
      deletedAt: company.deletedAt,
      documentation: company.documentation,
      documentationType: company.documentationType,
      email: company.email,
      id: company.id.toString(),
      startedIssueInvoicesAt: company.startedIssueInvoicesAt,
      stateRegistration: company.stateRegistration,
      status: company.status,
      updatedAt: company.updatedAt,
    }
  }

  static toUpdatePrisma(company: Company): Prisma.CompanyUpdateInput {
    if (!company.owner) {
      throw new Error('Owner not set in creation of company')
    }

    return {
      companyNane: company.companyName,
      address: {
        update: AddressesPrismaMapper.toPrisma(company.address),
      },
      sector: company.sector,
      createdAt: company.createdAt,
      deletedAt: company.deletedAt,
      documentation: company.documentation,
      documentationType: company.documentationType,
      email: company.email,
      id: company.id.toString(),
      startedIssueInvoicesAt: company.startedIssueInvoicesAt,
      stateRegistration: company.stateRegistration,
      status: company.status,
      updatedAt: company.updatedAt,
    }
  }
}
