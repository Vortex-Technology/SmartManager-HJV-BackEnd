import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { SellerRepository } from '../repositories/SellerRepository'
import { SellerNotFount } from '../errors/SellerNotFound'
import { Seller } from '../entities/Seller'

interface Request {
  sellerId: string
}

type Response = Either<
  SellerNotFount,
  {
    seller: Seller
  }
>

@Injectable()
export class GetSellerService {
  constructor(private readonly sellerRepository: SellerRepository) {}

  async execute({ sellerId }: Request): Promise<Response> {
    const seller = await this.sellerRepository.findById(sellerId)

    if (!seller) {
      return left(new SellerNotFount())
    }

    return right({
      seller,
    })
  }
}
