import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Post,
} from '@nestjs/common'
import { UserWrongCredentials } from '../errors/UserWrongCredentials'
import { ZodValidationPipe } from '@shared/pipes/zodValidation'
import { LoginUserService } from '../services/LoginUser.service'
import { statusCode } from 'src/config/statusCode'
import { Public } from '@providers/auth/decorators/public.decorator'
import { z } from 'zod'

const loginUserBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type LoginUserBody = z.infer<typeof loginUserBodySchema>
const bodyValidationPipe = new ZodValidationPipe(loginUserBodySchema)

@Controller('/users/login')
export class LoginUserController {
  constructor(private readonly loginUserService: LoginUserService) {}

  @Post()
  @Public()
  @HttpCode(statusCode.Created)
  async handle(@Body(bodyValidationPipe) body: LoginUserBody) {
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
