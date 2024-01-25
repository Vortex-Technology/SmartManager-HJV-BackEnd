import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { Either, left, right } from '@shared/core/error/Either'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import {
  Collaborator,
  CollaboratorRole,
} from '@modules/collaborator/entities/Collaborator'
import { Injectable } from '@nestjs/common'
import { CollaboratorsRepository } from '@modules/collaborator/repositories/CollaboratorsRepository'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { Company } from '@modules/company/entities/Company'
import { CompaniesRepository } from '@modules/company/repositories/CompaniesRepository'

interface Request {
  acceptedRoles: CollaboratorRole[]
  companyId: string
  collaboratorId: string
}

type Response = Either<
  CollaboratorNotFound | CompanyNotFound | PermissionDenied,
  { company: Company; collaborator: Collaborator }
>

@Injectable()
export class VerifyPermissionsOfCollaboratorInCompanyService {
  constructor(
    private readonly collaboratorsRepository: CollaboratorsRepository,
    private readonly companiesRepository: CompaniesRepository,
  ) {}

  async execute({
    acceptedRoles,
    collaboratorId,
    companyId,
  }: Request): Promise<Response> {
    const collaborator =
      await this.collaboratorsRepository.findById(collaboratorId)

    if (!collaborator) {
      return left(new CollaboratorNotFound())
    }

    if (!acceptedRoles.includes(collaborator.role)) {
      return left(new PermissionDenied())
    }

    const company = await this.companiesRepository.findById(companyId)
    if (!company) {
      return left(new CompanyNotFound())
    }

    if (collaborator.companyId && !collaborator.companyId.equals(company.id)) {
      return left(new PermissionDenied())
    }

    return right({ company, collaborator })
  }
}
