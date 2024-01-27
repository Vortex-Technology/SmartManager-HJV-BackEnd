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
  ConflictException,
  NotFoundException,
  BadRequestException,
  Res,
} from '@nestjs/common'
import { statusCode } from '@config/statusCode'
import { AuthCollaborator } from '@providers/auth/decorators/authCollaborator.decorator'
import { JwtRoleGuard } from '@providers/auth/guards/jwtRole.guard'
import { Roles } from '@providers/auth/decorators/roles.decorator'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { MarketNotFound } from '@modules/market/errors/MarketNorFound'
import { InventoryNotFount } from '@modules/inventory/errors/InventoryNotFound'
import { QuantityMustBeGreaterThanZero } from '../errors/QuantityMustBeGreaterThanZero'
import { ProductVariantAlreadyExistsWithSame } from '../errors/ProductVariantAlreadyExistsWithSame'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { ProductNotFound } from '../errors/ProductNotFound'
import { Response } from 'express'

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

      switch (error.constructor) {
        case CollaboratorNotFound:
        case CompanyNotFound:
        case MarketNotFound:
        case InventoryNotFount:
        case ProductVariantAlreadyExistsWithSame:
        case QuantityMustBeGreaterThanZero: {
          throw new ConflictException(error.message)
        }

        case PermissionDenied: {
          throw new ForbiddenException(error.message)
        }

        case ProductNotFound: {
          throw new NotFoundException(error.message)
        }

        default: {
          throw new BadRequestException(error.message)
        }
      }
    }

    const { productVariant } = response.value

    res.header(
      'X-Location',
      `/products/${productId}/variants/${productVariant.id}`,
    )

    return res.status(statusCode.Created).end()
  }
}
