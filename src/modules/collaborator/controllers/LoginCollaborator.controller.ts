import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common'
import { statusCode } from 'src/config/statusCode'
import { Public } from '@providers/auth/decorators/public.decorator'
import { CollaboratorWrongCredentials } from '../errors/CollaboratorWrongCredentials'
import { LoginCollaboratorService } from '../services/LoginCollaborator.service'
import {
  LoginCollaboratorBody,
  LoginCollaboratorParams,
  loginCollaboratorBodyValidationPipe,
  loginCollaboratorParamsValidationPipe,
} from '../gateways/LoginCollaborator.gateway'
import { CompanyApiKey } from '@providers/auth/decorators/companyApiKey.decorator'

@Controller('/companies/:companyId/markets/:marketId/collaborators/login')
export class LoginCollaboratorController {
  constructor(
    private readonly loginCollaboratorService: LoginCollaboratorService,
  ) {}

  @Post()
  @HttpCode(statusCode.Created)
  @Public()
  async handle(
    @Body(loginCollaboratorBodyValidationPipe) body: LoginCollaboratorBody,
    @Param(loginCollaboratorParamsValidationPipe)
    params: LoginCollaboratorParams,
    @CompanyApiKey() apiKey: string,
  ) {
    const { email, password } = body
    const { companyId, marketId } = params

    const response = await this.loginCollaboratorService.execute({
      companyId,
      marketId,
      email,
      password,
      apiKey,
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
