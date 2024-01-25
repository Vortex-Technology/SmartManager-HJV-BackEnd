import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common'
import { statusCode } from '@config/statusCode'
import { JwtRoleGuard } from '@providers/auth/guards/jwtRole.guard'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { Roles } from '@providers/auth/decorators/roles.decorator'
import { Response } from 'express'
import { AllProductVariantAlreadyExists } from '../errors/AllProductVariantAlreadyExists'
import { ProvideAtLeastOneProductVariant } from '../errors/ProvideAlmostOneProductVariant'
import { ProductErrosPresenter } from '../presenters/ProductErrosPresenter'
import {
  CreateProductBody,
  createProductBodyValidationPipe,
} from '../gateways/CreateProduct.gateway'
import { CreateProductService } from '../services/CreateProduct.service'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { ApiKeyGuard } from '@providers/auth/guards/apiKey.guard'
import { AuthCollaborator } from '@providers/auth/decorators/authCollaborator.decorator'
import { MarketNotFound } from '@modules/market/errors/MarketNorFound'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'

@UseGuards(ApiKeyGuard)
@Controller('/products')
export class CreateProductController {
  constructor(private readonly createProductService: CreateProductService) {}

  @Post()
  @AuthCollaborator()
  @HttpCode(statusCode.Created)
  @UseGuards(JwtRoleGuard)
  @Roles([
    CollaboratorRole.OWNER,
    CollaboratorRole.MANAGER,
    CollaboratorRole.STOCKIST,
  ])
  async handle(
    @Body(createProductBodyValidationPipe) body: CreateProductBody,
    @CurrentLoggedUserDecorator() user: TokenPayloadSchema,
    @Res() res: Response,
  ) {
    const { sub, companyId, marketId } = user

    if (!companyId || !marketId) {
      throw new ForbiddenException(
        'Please verify if you are logged in with a company',
      )
    }

    const response = await this.createProductService.execute({
      ...body,
      creatorId: sub,
      companyId,
      marketId,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case AllProductVariantAlreadyExists:
        case ProvideAtLeastOneProductVariant:
        case CollaboratorNotFound:
        case MarketNotFound:
        case CompanyNotFound: {
          throw new ConflictException(error.message)
        }

        case PermissionDenied: {
          throw new ForbiddenException(error.message)
        }

        default: {
          throw new BadRequestException(error.message)
        }
      }
    }

    const { product, errors } = response.value

    res.header('Location', `/products/${product.id.toString()}`)
    return res
      .status(statusCode.Created)
      .json(ProductErrosPresenter.toHTTP(errors))
  }
}
