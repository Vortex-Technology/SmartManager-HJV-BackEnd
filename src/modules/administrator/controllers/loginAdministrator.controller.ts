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
import { LoginAdministratorService } from '../services/loginAdministrator.service'
import { Public } from '@providers/auth/decorators/public.decorator'
import { AdministratorWrongCredentials } from '../errors/AdministratorWrongCredentials'
import { z } from 'zod'

const loginAdministratorBodySchema = z.object({
  login: z.string().min(4).max(30),
  password: z.string().min(8),
})

type LoginAdministratorBody = z.infer<typeof loginAdministratorBodySchema>
const bodyValidationPipe = new ZodValidationPipe(loginAdministratorBodySchema)

@Controller('/administrator/login')
export class LoginAdministratorController {
  constructor(
    private readonly loginAdministratorService: LoginAdministratorService,
  ) {}

  @Post()
  @HttpCode(statusCode.Created)
  @Public()
  async handle(@Body(bodyValidationPipe) body: LoginAdministratorBody) {
    const { login, password } = body

    const response = await this.loginAdministratorService.execute({
      login,
      password,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case AdministratorWrongCredentials: {
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
