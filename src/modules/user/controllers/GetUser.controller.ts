import {
  BadRequestException,
  ConflictException,
  Controller,
  Get,
  HttpCode,
} from '@nestjs/common'
import { GetUserService } from '../services/GetUser.service'
import { statusCode } from 'src/config/statusCode'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { UserPresenter } from '../presenters/UserPresenter'
import { UserNotFount } from '../errors/UserNotFound'

@Controller('/users')
export class GetUserController {
  constructor(private readonly getUserService: GetUserService) {}

  @Get()
  @HttpCode(statusCode.Ok)
  async handle(@CurrentLoggedUserDecorator() _user: TokenPayloadSchema) {
    const { sub } = _user

    const response = await this.getUserService.execute({
      userId: sub,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case UserNotFount: {
          throw new ConflictException(error.message)
        }

        default: {
          throw new BadRequestException(error.message)
        }
      }
    }

    const { user } = response.value

    return {
      user: UserPresenter.toHTTP(user),
    }
  }
}
