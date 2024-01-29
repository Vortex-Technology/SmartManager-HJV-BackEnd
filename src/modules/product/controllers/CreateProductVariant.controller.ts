import { ApiKeyGuard } from '@providers/auth/guards/apiKey.guard'
import {
  CreateProductVariantBody,
  CreateProductVariantParams,
  createProductVariantBodyValidationPipe,
  createProductVariantParamsValidationPipe,
} from '../gateways/CreateProductVariant.gateway'
import { CreateProductVariantService } from '../services/CreateProductVariant.service'
import {
  Body,
  Controller,
  Post,
  HttpCode,
  UseGuards,
  Param,
  ForbiddenException,
  Res,
} from '@nestjs/common'
import { statusCode } from '@config/statusCode'
import { AuthCollaborator } from '@providers/auth/decorators/authCollaborator.decorator'
import { JwtRoleGuard } from '@providers/auth/guards/jwtRole.guard'
import { Roles } from '@providers/auth/decorators/roles.decorator'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { Response } from 'express'
import { ErrorPresenter } from '@infra/presenters/ErrorPresenter'

@UseGuards(ApiKeyGuard)
@Controller('/products/:productId/variants')
export class CreateProductVariantController {
  constructor(
    private readonly createProductVariantService: CreateProductVariantService,
  ) {}

  @Post()
  @HttpCode(statusCode.Created)
  @AuthCollaborator()
  @UseGuards(JwtRoleGuard)
  @Roles([
    CollaboratorRole.MANAGER,
    CollaboratorRole.OWNER,
    CollaboratorRole.STOCKIST,
  ])
  async handle(
    @Body(createProductVariantBodyValidationPipe)
    body: CreateProductVariantBody,
    @Param(createProductVariantParamsValidationPipe)
    params: CreateProductVariantParams,
    @CurrentLoggedUserDecorator()
    user: TokenPayloadSchema,
    @Res() res: Response,
  ) {
    const { sub, companyId, marketId } = user
    const { productId } = params

    if (!companyId || !marketId) {
      throw new ForbiddenException(
        'Please verify if you are logged in with a company',
      )
    }

    const response = await this.createProductVariantService.execute({
      ...body,
      collaboratorId: sub,
      companyId,
      marketId,
      productId,
    })

    if (response.isLeft()) {
      const error = response.value
      return ErrorPresenter.toHTTP(error)
    }

    const { productVariant } = response.value

    res.header(
      'X-Location',
      `/products/${productId}/variants/${productVariant.id}`,
    )

    return res.status(statusCode.Created).end()
  }
}
