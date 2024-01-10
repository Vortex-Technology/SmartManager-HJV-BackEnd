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
import { ListAdministratorsService } from '../services/listAdministrators.service'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { AdministratorNotFount } from '../errors/AdministratorNotFound'
import { AdministratorPresenter } from '../presenters/administratorPresenter'
import { JwtRoleGuard } from '@providers/auth/guards/jwtRole.guard'
import { Roles } from '@providers/auth/decorators/roles.decorator'
import { AdministratorRole } from '../entities/Administrator'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { z } from 'zod'
import { ZodValidationPipe } from '@shared/pipes/zodValidation'
import { Response } from 'express'

const listAdministratorQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(5).optional().default(30),
})

type ListAdministratorsQuery = z.infer<typeof listAdministratorQuerySchema>
const queryValidationPipe = new ZodValidationPipe(listAdministratorQuerySchema)

@Controller('/administrator/list')
export class ListAdministratorsController {
  constructor(
    private readonly listAdministratorsService: ListAdministratorsService,
  ) {}

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
    @Query(queryValidationPipe) query: ListAdministratorsQuery,
    @Res() res: Response,
  ) {
    const { sub } = user
    const { limit, page } = query

    const response = await this.listAdministratorsService.execute({
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

    const { administrators, page: actualPage, size } = response.value

    res.header('X-Total-Count', String(size))
    res.header('X-Page', String(actualPage))

    return res.status(statusCode.Ok).json({
      administrators: administrators.map(AdministratorPresenter.toHTTP),
    })
  }
}
