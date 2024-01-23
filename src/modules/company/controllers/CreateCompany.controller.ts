import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  Res,
} from '@nestjs/common'
import { statusCode } from '@config/statusCode'
import { Response } from 'express'
import { CreateCompanyService } from '../services/CreateCompany.service'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { CompanyDocumentationType } from '../entities/Company'
import { UserNotFound } from '@modules/user/errors/UserNotFound'
import { DocumentationsIsMissing } from '../errors/DocumentationsIsMissing'
import { InsufficientMarkets } from '../errors/InsufficientMarkets'
import {
  CreateCompanyBody,
  createCompanyBodyValidationPipe,
} from '../gateways/CreateCompany.gateway'

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

      switch (error.constructor) {
        case UserNotFound:
        case DocumentationsIsMissing:
        case InsufficientMarkets: {
          throw new ConflictException(error.message)
        }

        default: {
          throw new BadRequestException(error.message)
        }
      }
    }

    const { company } = response.value

    res.header('X-Location', `/companies/${company.id}`)
    return res.status(statusCode.Created).end()
  }
}
