import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Post,
} from '@nestjs/common'
import { statusCode } from 'src/config/statusCode'
import { Public } from '@providers/auth/decorators/public.decorator'
import { CollaboratorWrongCredentials } from '../errors/CollaboratorWrongCredentials'
import { LoginCollaboratorService } from '../services/LoginCollaborator.service'
import {
  LoginCollaboratorBody,
  loginCollaboratorBodyValidationPipe,
} from '../gateways/loginCollaborator.gateway'

@Controller('/collaborators/login')
export class LoginCollaboratorController {
  constructor(
    private readonly loginCollaboratorService: LoginCollaboratorService,
  ) {}

  @Post()
  @HttpCode(statusCode.Created)
  @Public()
  async handle(
    @Body(loginCollaboratorBodyValidationPipe) body: LoginCollaboratorBody,
  ) {
    const { login, password } = body

    const response = await this.loginCollaboratorService.execute({
      
      login,
      password,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case CollaboratorWrongCredentials: {
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
