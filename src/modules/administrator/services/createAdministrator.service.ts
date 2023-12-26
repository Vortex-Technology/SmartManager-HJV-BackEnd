import { Injectable } from '@nestjs/common'
import { AdministratorRepository } from '../repositories/AdministratorRepository'
import { Either, left, right } from '@shared/core/error/Either'
import { Administrator, AdministratorRole } from '../entities/Administrator'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { AdministratorAlreadyExistsWithSame } from '../errors/AdministratorAlreadyExistsWithSame'
import { AdministratorNotFount } from '../errors/AdministratorNotFound'

interface Request {
  name: string
  login: string
  password: string
  image?: string
  role?: 'FULL_ACCESS' | 'EDITOR' | 'VIEWER'
  creatorId: string
}

type Response = Either<
  AdministratorAlreadyExistsWithSame | AdministratorNotFount | PermissionDenied,
  {
    administrator: Administrator
  }
>

@Injectable()
export class CreateAdministratorService {
  constructor(
    private readonly administratorRepository: AdministratorRepository,
    private readonly hasherGenerator: HashGenerator,
  ) {}

  async execute({
    login,
    name,
    password,
    image,
    role,
    creatorId,
  }: Request): Promise<Response> {
    const creator = await this.administratorRepository.findById(creatorId)

    if (!creator) {
      return left(new AdministratorNotFount())
    }

    if (
      creator.role !== AdministratorRole.MASTER &&
      creator.role !== AdministratorRole.FULL_ACCESS
    ) {
      return left(new PermissionDenied())
    }

    const administratorWithTheSameLoginExists =
      await this.administratorRepository.findByLogin(login)

    if (administratorWithTheSameLoginExists) {
      return left(new AdministratorAlreadyExistsWithSame('login'))
    }

    const encryptedPassword = await this.hasherGenerator.hash(password)

    const roleMapper = {
      FULL_ACCESS: AdministratorRole.FULL_ACCESS,
      EDITOR: AdministratorRole.EDITOR,
      VIEWER: AdministratorRole.VIEWER,
    }

    const administrator = Administrator.create({
      login,
      name,
      image,
      password: encryptedPassword,
      role: role ? roleMapper[role] : undefined,
    })

    await this.administratorRepository.create(administrator)

    return right({
      administrator,
    })
  }
}
