import {
  BadRequestException,
  ConflictException,
  Controller,
  Get,
  HttpCode,
} from '@nestjs/common'
import { statusCode } from 'src/config/statusCode'
import { GetSellerService } from '../services/getSeller.service'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { SellerNotFount } from '../errors/SellerNotFound'
import { SellerPresenter } from '../presenters/sellerPresenter'

@Controller('/seller')
export class GetSellerController {
  constructor(private readonly getSellerService: GetSellerService) {}

  @Get()
  @HttpCode(statusCode.Ok)
  async handle(@CurrentLoggedUserDecorator() user: TokenPayloadSchema) {
    const { sub } = user

    const response = await this.getSellerService.execute({
      sellerId: sub,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case SellerNotFount: {
          throw new ConflictException(error.message)
        }

        default: {
          throw new BadRequestException(error.message)
        }
      }
    }

    const { seller } = response.value

    return {
      seller: SellerPresenter.toHTTP(seller),
    }
  }
}
