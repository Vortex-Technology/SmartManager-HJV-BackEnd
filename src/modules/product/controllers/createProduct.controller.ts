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
import { CreateProductService } from '../services/createProduct.service'
import { ProductUnitType } from '../entities/Product'
import { AllProductVariantAlreadyExists } from '../errors/AllProductVariantAlreadyExists'
import { ProvideAtLeastOneProductVariant } from '../errors/ProvideAlmostOneProductVariant'
import { ProductErrosPresenter } from '../presenters/ProductErrosPresenter'

const createProductBodySchema = z.object({
  name: z.string().min(3).max(60),
  categories: z.array(z.string()).optional(),
  variants: z
    .array(
      z.object({
        name: z.string().min(3).max(60),
        description: z.string().max(190).optional(),
        model: z.string().max(60).optional(),
        pricePerUnit: z.number(),
        brand: z.string().min(2).max(60),
        image: z.string().url().optional(),
        barCode: z.string().max(48),
        unitType: z.enum([
          ProductUnitType.UNIT,
          ProductUnitType.KILOS,
          ProductUnitType.CENTIMETERS,
          ProductUnitType.LITERS,
          ProductUnitType.METERS,
          ProductUnitType.POL,
        ]),
      }),
    )
    .min(1),
})

type CreateProductBody = z.infer<typeof createProductBodySchema>
const bodyValidationPipe = new ZodValidationPipe(createProductBodySchema)

@Controller('/products')
export class CreateProductController {
  constructor(private readonly createProductService: CreateProductService) {}

  @Post()
  @HttpCode(statusCode.Created)
  @UseGuards(JwtRoleGuard)
  @Roles([
    AdministratorRole.MASTER,
    AdministratorRole.FULL_ACCESS,
    AdministratorRole.EDITOR,
  ])
  async handle(
    @Body(bodyValidationPipe) body: CreateProductBody,
    @CurrentLoggedUserDecorator() user: TokenPayloadSchema,
    @Res() res: Response,
  ) {
    const { name, variants, categories } = body
    const { sub } = user

    const response = await this.createProductService.execute({
      name,
      creatorId: sub,
      variants,
      categories,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case AllProductVariantAlreadyExists:
        case ProvideAtLeastOneProductVariant:
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

    const { product, errors } = response.value

    res.header('Location', `/products/${product.id.toString()}`)
    return res
      .status(statusCode.Created)
      .json(ProductErrosPresenter.toHTTP(errors))
  }
}
