import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Post,
} from '@nestjs/common'
import { UserWrongCredentials } from '../errors/UserWrongCredentials'
import { LoginUserService } from '../services/LoginUser.service'
import { statusCode } from '@config/statusCode'
import { Public } from '@providers/auth/decorators/public.decorator'
import {
  LoginUserBody,
  loginUserBodyValidationPipe,
} from '../gateways/LoginUser.gateway'

@Controller('/users/login')
export class LoginUserController {
  constructor(private readonly loginUserService: LoginUserService) {}

  @Post()
  @Public()
  @HttpCode(statusCode.Created)
  async handle(@Body(loginUserBodyValidationPipe) body: LoginUserBody) {
    const { email, password } = body

    const response = await this.loginUserService.execute({
      email,
      password,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case UserWrongCredentials: {
          throw new ForbiddenException(error.message)
        }

        default: {
          throw new BadRequestException(error.message)
        }
      }
    }

    const { accessToken, refreshToken } = response.value

    return {
      accessToken,
      refreshToken,
    }
  }
}
