import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common'
import { statusCode } from '@config/statusCode'
import { Response } from 'express'
import { CreateCompanyService } from '../services/CreateCompany.service'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { CompanyDocumentationType } from '../entities/Company'
import {
  CreateCompanyBody,
  createCompanyBodyValidationPipe,
} from '../gateways/CreateCompany.gateway'
import { ErrorPresenter } from '@infra/presenters/ErrorPresenter'

@Controller('/companies')
export class CreateCompanyController {
  constructor(private readonly createCompanyService: CreateCompanyService) {}

  @Post()
  @HttpCode(statusCode.Created)
  async handle(
    @Body(createCompanyBodyValidationPipe) body: CreateCompanyBody,
    @CurrentLoggedUserDecorator() user: TokenPayloadSchema,
    @Res() res: Response,
  ) {
    const { sub: userId } = user

    const response = await this.createCompanyService.execute({
      ...body,
      documentationType: body.documentationType as CompanyDocumentationType,
      userId,
    })

    if (response.isLeft()) {
      const error = response.value
      return ErrorPresenter.toHTTP(error)
    }

    const { company } = response.value

    res.header('X-Location', `/companies/${company.id}`)
    return res.status(statusCode.Created).end()
  }
}
