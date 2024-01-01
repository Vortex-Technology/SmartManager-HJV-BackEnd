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
import { ZodValidationPipe } from '@shared/pipes/zodValidation'
import { statusCode } from 'src/config/statusCode'
import { z } from 'zod'
import { JwtRoleGuard } from '@providers/auth/guards/jwtRole.guard'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { Roles } from '@providers/auth/decorators/roles.decorator'
import { Response } from 'express'
import { AdministratorRole } from '@modules/administrator/entities/Administrator'
import { AdministratorNotFount } from '@modules/administrator/errors/AdministratorNotFound'
import { CreateProductCategoryService } from '../services/createProductCategory.service'
import { ProductCategoryAlreadyExists } from '../errors/ProductCategoryAlreadyExists'

const createProductCategoryBodySchema = z.object({
  name: z.string().min(3).max(60),
  description: z.string().max(190).optional(),
})

type CreateProductCategoryBody = z.infer<typeof createProductCategoryBodySchema>
const bodyValidationPipe = new ZodValidationPipe(
  createProductCategoryBodySchema,
)

@Controller('/categories/products')
export class CreateProductCategoryController {
  constructor(
    private readonly createProductCategoryService: CreateProductCategoryService,
  ) {}

  @Post()
  @HttpCode(statusCode.Created)
  @UseGuards(JwtRoleGuard)
  @Roles([
    AdministratorRole.MASTER,
    AdministratorRole.FULL_ACCESS,
    AdministratorRole.EDITOR,
  ])
  async handle(
    @Body(bodyValidationPipe) body: CreateProductCategoryBody,
    @CurrentLoggedUserDecorator() user: TokenPayloadSchema,
    @Res() res: Response,
  ) {
    const { name, description } = body
    const { sub } = user

    const response = await this.createProductCategoryService.execute({
      name,
      description,
      creatorId: sub,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case ProductCategoryAlreadyExists:
        case AdministratorNotFount: {
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
      'Location',
      `/categories/products/${productCategory.id.toString()}`,
    )
    return res.status(statusCode.Created).end()
  }
}
