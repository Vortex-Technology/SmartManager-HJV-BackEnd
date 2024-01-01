import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Post,
} from '@nestjs/common'
import { ZodValidationPipe } from '@shared/pipes/zodValidation'
import { statusCode } from 'src/config/statusCode'
import { LoginSellerService } from '../services/loginSeller.service'
import { Public } from '@providers/auth/decorators/public.decorator'
import { SellerWrongCredentials } from '../errors/SellerWrongCredentials'
import { z } from 'zod'

const loginSellerBodySchema = z.object({
  login: z.string().min(4).max(30),
  password: z.string().min(8),
})

type LoginSellerBody = z.infer<typeof loginSellerBodySchema>
const bodyValidationPipe = new ZodValidationPipe(loginSellerBodySchema)

@Controller('/seller/login')
export class LoginSellerController {
  constructor(private readonly loginSellerService: LoginSellerService) {}

  @Post()
  @HttpCode(statusCode.Created)
  @Public()
  async handle(@Body(bodyValidationPipe) body: LoginSellerBody) {
    const { login, password } = body

    const response = await this.loginSellerService.execute({
      login,
      password,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case SellerWrongCredentials: {
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
