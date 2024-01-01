import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { AttendantAlreadyExistsWithSame } from '@modules/attendant/errors/AttendantAlreadyExistsWithSame'
import { AttendantRepository } from '@modules/attendant/repositories/AttendantRepository'
import { Attendant } from '@modules/attendant/entities/Attendant'
import { AdministratorRepository } from '../repositories/AdministratorRepository'
import { AdministratorNotFount } from '../errors/AdministratorNotFound'
import { AdministratorRole } from '../entities/Administrator'

interface Request {
  name: string
  login: string
  password: string
  creatorId: string
}

type Response = Either<
  AttendantAlreadyExistsWithSame | PermissionDenied | AdministratorNotFount,
  {
    attendant: Attendant
  }
>

@Injectable()
export class CreateAttendantService {
  constructor(
    private readonly administratorRepository: AdministratorRepository,
    private readonly attendantRepository: AttendantRepository,
    private readonly hasherGenerator: HashGenerator,
  ) {}

  async execute({
    login,
    name,
    password,
    creatorId,
  }: Request): Promise<Response> {
    const acceptCreateAttendantForRoles = [
      AdministratorRole.MASTER,
      AdministratorRole.FULL_ACCESS,
      AdministratorRole.EDITOR,
    ]

    const creator = await this.administratorRepository.findById(creatorId)

    if (!creator) {
      return left(new AdministratorNotFount())
    }

    if (!acceptCreateAttendantForRoles.includes(creator.role)) {
      return left(new PermissionDenied())
    }

    const attendantWithTheSameLoginExists =
      await this.attendantRepository.findByLogin(login)

    if (attendantWithTheSameLoginExists) {
      return left(new AttendantAlreadyExistsWithSame('login'))
    }

    const encryptedPassword = await this.hasherGenerator.hash(password)

    const attendant = Attendant.create({
      login,
      name,
      password: encryptedPassword,
    })

    await this.attendantRepository.create(attendant)

    return right({
      attendant,
    })
  }
}
