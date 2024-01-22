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
import { ZodValidationPipe } from '@shared/pipes/ZodValidation'
import { statusCode } from 'src/config/statusCode'
import { z } from 'zod'
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

const createProductCategoryBodySchema = z.object({
  name: z.string().min(3).max(60),
  description: z.string().max(190).optional(),
})

type CreateProductCategoryBody = z.infer<typeof createProductCategoryBodySchema>
const bodyValidationPipe = new ZodValidationPipe(
  createProductCategoryBodySchema,
)

@Controller('/products/categories')
export class CreateProductCategoryController {
  constructor(
    private readonly createProductCategoryService: CreateProductCategoryService,
  ) {}

  @Post()
  @HttpCode(statusCode.Created)
  @UseGuards(JwtRoleGuard)
  @Roles([
    CollaboratorRole.OWNER,
    CollaboratorRole.MANAGER,
    CollaboratorRole.STOCKIST,
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
      'Location',
      `/products/categories/${productCategory.id.toString()}`,
    )
    return res.status(statusCode.Created).end()
  }
}
