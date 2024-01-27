import {
  BadRequestException,
  ConflictException,
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Res,
} from '@nestjs/common'
import { statusCode } from '@config/statusCode'
import { Response } from 'express'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import {
  GenerateApiKeyParams,
  generateApiKeyParamsValidationPipe,
} from '../gateways/GenerateApiKey.gateway'
import { CompanyNotFound } from '../errors/CompanyNotFound'
import { LotsOfExistingKeys } from '../errors/LotsOfExistingKeys'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { GenerateApiKeyCompanyService } from '../services/GenerateApiKeyCompany.service'

@Controller('/companies/:companyId/apiKeys/generate')
export class GenerateApiKeyCompanyController {
  constructor(
    private readonly generateApiKeyCompanyService: GenerateApiKeyCompanyService,
  ) {}

  @Post()
  @HttpCode(statusCode.Created)
  async handle(
    @CurrentLoggedUserDecorator() user: TokenPayloadSchema,
    @Param(generateApiKeyParamsValidationPipe) params: GenerateApiKeyParams,
    @Res() res: Response,
  ) {
    const { sub: userId } = user
    const { companyId } = params

    const response = await this.generateApiKeyCompanyService.execute({
      companyId,
      userId,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case CompanyNotFound: {
          throw new NotFoundException(error.message)
        }

        case PermissionDenied: {
          throw new ForbiddenException(error.message)
        }

        case LotsOfExistingKeys: {
          throw new ConflictException(error.message)
        }

        default: {
          throw new BadRequestException(error.message)
        }
      }
    }

    const { apiKey } = response.value

    res.header('X-Location', `/companies/${companyId}/apiKeys/${apiKey.id}`)
    res.header('X-Api-Key', apiKey.key)
    return res.status(statusCode.Created).end()
  }
}
