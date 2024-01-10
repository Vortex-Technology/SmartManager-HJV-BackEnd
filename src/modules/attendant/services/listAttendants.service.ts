import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { AttendantRepository } from '../repositories/AttendantRepository'
import { Attendant } from '../entities/Attendant'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { AdministratorRepository } from '@modules/administrator/repositories/AdministratorRepository'
import { AdministratorRole } from '@modules/administrator/entities/Administrator'
import { AdministratorNotFount } from '@modules/administrator/errors/AdministratorNotFound'

interface Request {
  administratorId: string
  page: number
  limit: number
}

type Response = Either<
  AdministratorNotFount | PermissionDenied,
  {
    attendants: Attendant[]
    size: number
    page: number
  }
>

@Injectable()
export class ListAttendantsService {
  constructor(
    private readonly attendantRepository: AttendantRepository,
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

    const attendants = await this.attendantRepository.findMany({
      limit,
      page,
    })

    const attendantCount = await this.attendantRepository.count()

    return right({
      attendants,
      page,
      size: attendantCount,
    })
  }
}
