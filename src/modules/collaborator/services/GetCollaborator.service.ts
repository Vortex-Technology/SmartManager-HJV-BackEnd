import { CollaboratorNotFound } from '@modules/refreshToken/errors/CollaboratorNotFound'
import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { Collaborator } from '../entities/Collaborator'
import { CollaboratorsRepository } from '../repositories/CollaboratorsRepository'

interface Request {
  id: string
}

type Response = Either<CollaboratorNotFound, { collaborator: Collaborator }>

@Injectable()
export class GetCollaboratorService {
  constructor(
    private readonly collaboratorsRepository: CollaboratorsRepository,
  ) {}

  async execute({ id }: Request): Promise<Response> {
    const collaborator = await this.collaboratorsRepository.findById(id)

    if (!collaborator) {
      return left(new CollaboratorNotFound())
    }

    return right({ collaborator })
  }
}
