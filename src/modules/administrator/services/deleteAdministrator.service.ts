import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { AdministratorRepository } from '../repositories/AdministratorRepository'
import { AdministratorNotFount } from '../errors/AdministratorNotFound'
import { AdministratorRole } from '../entities/Administrator'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { AdministratorToExcludeNotFound } from '../errors/AdministratorToExcludeNotFound'

interface Request {
  administratorId: string
  excluderId: string
}

type Response = Either<
  AdministratorNotFount | AdministratorToExcludeNotFound | PermissionDenied,
  null
>

@Injectable()
export class DeleteAdministratorService {
  constructor(
    private readonly administratorRepository: AdministratorRepository,
  ) {}

  async execute({ administratorId, excluderId }: Request): Promise<Response> {
    const acceptDeletionForRoles = [
      AdministratorRole.MASTER,
      AdministratorRole.FULL_ACCESS,
    ]

    const excluder = await this.administratorRepository.findById(excluderId)

    if (!excluder) {
      return left(new AdministratorNotFount())
    }

    if (!acceptDeletionForRoles.includes(excluder.role)) {
      return left(new PermissionDenied())
    }

    const administrator =
      await this.administratorRepository.findById(administratorId)

    if (!administrator) {
      return left(new AdministratorToExcludeNotFound())
    }

    const administratorIsMaster =
      administrator.role === AdministratorRole.MASTER

    if (administratorIsMaster) {
      return left(new PermissionDenied())
    }

    const excluderIsFullAccess = excluder.role === AdministratorRole.FULL_ACCESS
    const administratorIsFullAccess =
      administrator.role === AdministratorRole.FULL_ACCESS

    if (excluderIsFullAccess && administratorIsFullAccess) {
      return left(new PermissionDenied())
    }

    administrator.deletedAt = new Date()

    await this.administratorRepository.save(administrator)

    return right(null)
  }
}
