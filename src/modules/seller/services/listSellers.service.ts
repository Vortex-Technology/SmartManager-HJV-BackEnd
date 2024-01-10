import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { SellerRepository } from '../repositories/SellerRepository'
import { Seller } from '../entities/Seller'
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
    sellers: Seller[]
    size: number
    page: number
  }
>

@Injectable()
export class ListSellersService {
  constructor(
    private readonly sellerRepository: SellerRepository,
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

    const sellers = await this.sellerRepository.findMany({
      limit,
      page,
    })

    const sellerCount = await this.sellerRepository.count()

    return right({
      sellers,
      page,
      size: sellerCount,
    })
  }
}
