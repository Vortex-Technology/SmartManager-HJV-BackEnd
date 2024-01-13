import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { OwnersRepository } from '../repositories/OwnersRepository'
import { Owner } from '../entities/Owner'
import { OwnerNotFount } from '../errors/OwnerNotFound'

interface Request {
  ownerId: string
}

type Response = Either<
  OwnerNotFount,
  {
    owner: Owner
  }
>

@Injectable()
export class GetOwnerService {
  constructor(private readonly ownersRepository: OwnersRepository) {}

  async execute({ ownerId }: Request): Promise<Response> {
    const owner = await this.ownersRepository.findById(ownerId)

    if (!owner) {
      return left(new OwnerNotFount())
    }

    return right({
      owner,
    })
  }
}
