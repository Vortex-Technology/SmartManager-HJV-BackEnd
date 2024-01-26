import {
  Company,
  CompanyDocumentationType,
  CompanyStatus,
} from '@modules/company/entities/Company'
import {
  Company as CompanyPrisma,
  Collaborator as OwnerPrisma,
  Prisma,
  Address as AddressPrisma,
} from '@prisma/client'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { AddressesPrismaMapper } from '../address/AddressesPrismaMapper'
import { CollaboratorsPrismaMapper } from '../collaborator/CollaboratorsPrismaMapper'
import { OwnersPrismaMapper } from '../owner/OwnersPrismaMapper'
import { Owner } from '@modules/owner/entities/Owner'

export type CompanyWithAddressAndOwnerIdPrisma = CompanyPrisma & {
  address: AddressPrisma
  owner:
    | OwnerPrisma
    | {
        id: string
      }
    | null
}

export class CompaniesPrismaMapper {
  static toEntity(raw: CompanyWithAddressAndOwnerIdPrisma): Company {
    if (!raw.owner?.id) {
      throw new Error('Owner not exist in company')
    }

    let owner: Owner | null = null

    if (raw.owner && (raw.owner as OwnerPrisma).role) {
      owner = OwnersPrismaMapper.toEntity({
        ...raw.owner,
        companyId: raw.id,
      } as OwnerPrisma)
    }

    return Company.create(
      {
        companyName: raw.companyNane,
        founderId: new UniqueEntityId(raw.founderId),
        ownerId: new UniqueEntityId(raw.owner.id),
        owner,
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

    const { companyId: _, ...owner } = CollaboratorsPrismaMapper.toPrisma(
      company.owner,
    )

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
        create: owner,
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
