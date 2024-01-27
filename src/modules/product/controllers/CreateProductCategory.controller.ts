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
import { ProductCategoryAlreadyExists } from '../errors/ProductCategoryAlreadyExists'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { CreateProductCategoryService } from '../services/CreateProductCategory.service'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import {
  CreateProductCategoryBody,
  createProductCategoryBodyValidationPipe,
} from '../gateways/CreateProductCategory.gateway'
import { ApiKeyGuard } from '@providers/auth/guards/apiKey.guard'
import { AuthCollaborator } from '@providers/auth/decorators/authCollaborator.decorator'

@UseGuards(ApiKeyGuard)
@Controller('/products/categories')
export class CreateProductCategoryController {
  constructor(
    private readonly createProductCategoryService: CreateProductCategoryService,
  ) {}

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
    @Body(createProductCategoryBodyValidationPipe)
    body: CreateProductCategoryBody,
    @CurrentLoggedUserDecorator() user: TokenPayloadSchema,
    @Res() res: Response,
  ) {
    const { name, description } = body
    const { sub, companyId, marketId } = user

    if (!companyId || !marketId) {
      throw new ForbiddenException(
        'Please verify if you are logged in with a company',
      )
    }

    const response = await this.createProductCategoryService.execute({
      name,
      description,
      creatorId: sub,
      companyId,
      marketId,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case ProductCategoryAlreadyExists:
        case CollaboratorNotFound: {
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

    const { productCategory } = response.value

    res.header(
      'X-Location',
      `/products/categories/${productCategory.id.toString()}`,
    )
    return res.status(statusCode.Created).end()
  }
}
