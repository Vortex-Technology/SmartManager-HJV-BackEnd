import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { Owner } from '../entities/Owner'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { OwnerAlreadyExistsWithSameLogin } from '../errors/OwnerAlreadyExistsWithSameLogin'
import { MasterNotFound } from '@modules/master/errors/MasterNotFound'
import { OwnersRepository } from '../repositories/OwnersRepository'
import { MastersRepository } from '@modules/master/repositories/MastersRepository'

interface Request {
  name: string
  login: string
  password: string
  image?: string
  masterId: string
}

type Response = Either<
  OwnerAlreadyExistsWithSameLogin | MasterNotFound,
  {
    owner: Owner
  }
>

@Injectable()
export class CreateOwnerService {
  constructor(
    private readonly ownerRepository: OwnersRepository,
    private readonly mastersRepository: MastersRepository,
    private readonly hasherGenerator: HashGenerator,
  ) {}

  async execute({
    login,
    name,
    password,
    image,
    masterId,
  }: Request): Promise<Response> {
    const master = await this.mastersRepository.findById(masterId)

    if (!master) {
      return left(new MasterNotFound())
    }

    const ownerExists = await this.ownerRepository.findByLogin(login)

    if (ownerExists) {
      return left(new OwnerAlreadyExistsWithSameLogin())
    }

    const encryptedPassword = await this.hasherGenerator.hash(password)

    const owner = Owner.create({
      login,
      name,
      image,
      password: encryptedPassword,
    })

    await this.ownerRepository.create(owner)

    return right({
      owner,
    })
  }
}
