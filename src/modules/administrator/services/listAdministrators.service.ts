import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { AdministratorRepository } from '../repositories/AdministratorRepository'
import { AdministratorNotFount } from '../errors/AdministratorNotFound'
import { Administrator, AdministratorRole } from '../entities/Administrator'
import { PermissionDenied } from '@shared/errors/PermissionDenied'

interface Request {
  administratorId: string
  page: number
  limit: number
}

type Response = Either<
  AdministratorNotFount | PermissionDenied,
  {
    administrators: Administrator[]
    size: number
    page: number
  }
>

@Injectable()
export class ListAdministratorsService {
  constructor(
    private readonly administratorRepository: AdministratorRepository,
  ) {}

  async execute({ administratorId, page, limit }: Request): Promise<Response> {
    const acceptListForRoles = [
      AdministratorRole.MASTER,
      AdministratorRole.FULL_ACCESS,
      AdministratorRole.EDITOR,
      AdministratorRole.VIEWER,
    ]

    const administrator =
      await this.administratorRepository.findById(administratorId)

    if (!administrator) {
      return left(new AdministratorNotFount())
    }

    if (!acceptListForRoles.includes(administrator.role)) {
      return left(new PermissionDenied())
    }

    const administrators = await this.administratorRepository.findMany({
      limit,
      page,
    })

    const administratorCount = await this.administratorRepository.count()

    return right({
      administrators,
      page,
      size: administratorCount,
    })
  }
}
