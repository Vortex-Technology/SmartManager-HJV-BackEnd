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
import { LoginOwnerService } from '../services/loginOwner.service'
import { Public } from '@providers/auth/decorators/public.decorator'
import { OwnerWrongCredentials } from '../errors/OwnerWrongCredentials'
import { z } from 'zod'

const loginOwnerBodySchema = z.object({
  login: z.string().min(4).max(30),
  password: z.string().min(8),
})

type LoginOwnerBody = z.infer<typeof loginOwnerBodySchema>
const bodyValidationPipe = new ZodValidationPipe(loginOwnerBodySchema)

@Controller('/owners/login')
export class LoginOwnerController {
  constructor(private readonly loginOwnerService: LoginOwnerService) {}

  @Post()
  @HttpCode(statusCode.Created)
  @Public()
  async handle(@Body(bodyValidationPipe) body: LoginOwnerBody) {
    const { login, password } = body

    const response = await this.loginOwnerService.execute({
      login,
      password,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case OwnerWrongCredentials: {
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
