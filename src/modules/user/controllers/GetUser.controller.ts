import { Controller, Get, HttpCode } from '@nestjs/common'
import { GetUserService } from '../services/GetUser.service'
import { statusCode } from '@config/statusCode'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { UserPresenter } from '../presenters/UserPresenter'
import { ErrorPresenter } from '@infra/presenters/ErrorPresenter'

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
      return ErrorPresenter.toHTTP(error)
    }

    const { user } = response.value

    return {
      user: UserPresenter.toHTTP(user),
    }
  }
}
