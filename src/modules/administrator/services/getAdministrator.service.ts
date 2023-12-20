import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { AdministratorRepository } from '../repositories/AdministratorRepository'
import { AdministratorNotFount } from '../errors/AdministratorNotFound'
import { Administrator } from '../entities/Administrator'

interface Request {
  administratorId: string
}

type Response = Either<
  AdministratorNotFount,
  {
    administrator: Administrator
  }
>

@Injectable()
export class GetAdministratorService {
  constructor(
    private readonly administratorRepository: AdministratorRepository,
  ) {}

  async execute({ administratorId }: Request): Promise<Response> {
    const administrator =
      await this.administratorRepository.findById(administratorId)

    if (!administrator) {
      return left(new AdministratorNotFount())
    }

    return right({
      administrator,
    })
  }
}
