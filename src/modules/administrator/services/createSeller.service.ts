import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { SellerAlreadyExistsWithSame } from '@modules/seller/errors/SellerAlreadyExistsWithSame'
import { SellerRepository } from '@modules/seller/repositories/SellerRepository'
import { Seller } from '@modules/seller/entities/Seller'
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
  SellerAlreadyExistsWithSame | PermissionDenied | AdministratorNotFount,
  {
    seller: Seller
  }
>

@Injectable()
export class CreateSellerService {
  constructor(
    private readonly administratorRepository: AdministratorRepository,
    private readonly sellerRepository: SellerRepository,
    private readonly hasherGenerator: HashGenerator,
  ) {}

  async execute({
    login,
    name,
    password,
    creatorId,
  }: Request): Promise<Response> {
    const acceptCreateSellerForRoles = [
      AdministratorRole.MASTER,
      AdministratorRole.FULL_ACCESS,
      AdministratorRole.EDITOR,
    ]

    const creator = await this.administratorRepository.findById(creatorId)

    if (!creator) {
      return left(new AdministratorNotFount())
    }

    if (!acceptCreateSellerForRoles.includes(creator.role)) {
      return left(new PermissionDenied())
    }

    const sellerWithTheSameLoginExists =
      await this.sellerRepository.findByLogin(login)

    if (sellerWithTheSameLoginExists) {
      return left(new SellerAlreadyExistsWithSame('login'))
    }

    const encryptedPassword = await this.hasherGenerator.hash(password)

    const seller = Seller.create({
      login,
      name,
      password: encryptedPassword,
    })

    await this.sellerRepository.create(seller)

    return right({
      seller,
    })
  }
}
