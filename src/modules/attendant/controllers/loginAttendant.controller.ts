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
import { LoginAttendantService } from '../services/loginAttendant.service'
import { Public } from '@providers/auth/decorators/public.decorator'
import { AttendantWrongCredentials } from '../errors/AttendantWrongCredentials'
import { z } from 'zod'

const loginAttendantBodySchema = z.object({
  login: z.string().min(4).max(30),
  password: z.string().min(8),
})

type LoginAttendantBody = z.infer<typeof loginAttendantBodySchema>
const bodyValidationPipe = new ZodValidationPipe(loginAttendantBodySchema)

@Controller('/attendants/login')
export class LoginAttendantController {
  constructor(private readonly loginAttendantService: LoginAttendantService) {}

  @Post()
  @HttpCode(statusCode.Created)
  @Public()
  async handle(@Body(bodyValidationPipe) body: LoginAttendantBody) {
    const { login, password } = body

    const response = await this.loginAttendantService.execute({
      login,
      password,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case AttendantWrongCredentials: {
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
