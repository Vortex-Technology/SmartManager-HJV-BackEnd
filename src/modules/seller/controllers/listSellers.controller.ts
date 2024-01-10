import {
  BadRequestException,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common'
import { statusCode } from 'src/config/statusCode'
import { ListSellersService } from '../services/listSellers.service'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { SellerPresenter } from '../presenters/sellerPresenter'
import { JwtRoleGuard } from '@providers/auth/guards/jwtRole.guard'
import { Roles } from '@providers/auth/decorators/roles.decorator'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { z } from 'zod'
import { ZodValidationPipe } from '@shared/pipes/zodValidation'
import { Response } from 'express'
import { AdministratorRole } from '@modules/administrator/entities/Administrator'
import { AdministratorNotFount } from '@modules/administrator/errors/AdministratorNotFound'

const listSellerQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(5).optional().default(30),
})

type ListSellersQuery = z.infer<typeof listSellerQuerySchema>
const queryValidationPipe = new ZodValidationPipe(listSellerQuerySchema)

@Controller('/sellers/list')
export class ListSellersController {
  constructor(private readonly listSellersService: ListSellersService) {}

  @Get()
  @HttpCode(statusCode.Ok)
  @UseGuards(JwtRoleGuard)
  @Roles([
    AdministratorRole.MASTER,
    AdministratorRole.FULL_ACCESS,
    AdministratorRole.EDITOR,
    AdministratorRole.VIEWER,
  ])
  async handle(
    @CurrentLoggedUserDecorator() user: TokenPayloadSchema,
    @Query(queryValidationPipe) query: ListSellersQuery,
    @Res() res: Response,
  ) {
    const { sub } = user
    const { limit, page } = query

    const response = await this.listSellersService.execute({
      administratorId: sub,
      limit,
      page,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
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

    const { sellers, page: actualPage, size } = response.value

    res.header('X-Total-Count', String(size))
    res.header('X-Page', String(actualPage))

    return res.status(statusCode.Ok).json({
      sellers: sellers.map(SellerPresenter.toHTTP),
    })
  }
}
