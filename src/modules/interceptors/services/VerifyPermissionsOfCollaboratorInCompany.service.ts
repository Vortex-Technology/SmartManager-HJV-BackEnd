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
import { Company, CompanyStatus } from '@modules/company/entities/Company'
import { CompaniesRepository } from '@modules/company/repositories/CompaniesRepository'
import { CompanyInactive } from '@modules/company/errors/CompanyInactive'

interface Request {
  acceptedRoles: CollaboratorRole[]
  companyId: string
  collaboratorId?: string
  collaborator?: Collaborator
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
    collaborator: _collaborator,
  }: Request): Promise<Response> {
    if (!_collaborator && !collaboratorId) {
      return left(new CollaboratorNotFound())
    }

    let collaborator: Collaborator | null = _collaborator ?? null
    if (!_collaborator && collaboratorId) {
      collaborator = await this.collaboratorsRepository.findById(collaboratorId)
    }

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

    if (company.status === CompanyStatus.INACTIVE) {
      return left(new CompanyInactive())
    }

    return right({ company, collaborator })
  }
}
