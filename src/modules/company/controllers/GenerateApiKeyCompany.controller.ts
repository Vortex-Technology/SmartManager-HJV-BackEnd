import { Controller, HttpCode, Param, Post, Res } from '@nestjs/common'
import { statusCode } from '@config/statusCode'
import { Response } from 'express'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import {
  GenerateApiKeyParams,
  generateApiKeyParamsValidationPipe,
} from '../gateways/GenerateApiKey.gateway'
import { GenerateApiKeyCompanyService } from '../services/GenerateApiKeyCompany.service'
import { ErrorPresenter } from '@infra/presenters/ErrorPresenter'

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
      return ErrorPresenter.toHTTP(error)
    }

    const { apiKey } = response.value

    res.header('X-Location', `/companies/${companyId}/apiKeys/${apiKey.id}`)
    res.header('X-Api-Key', apiKey.key)
    return res.status(statusCode.Created).end()
  }
}
