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
import { ListAttendantsService } from '../services/listAttendants.service'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { AttendantPresenter } from '../presenters/attendantPresenter'
import { JwtRoleGuard } from '@providers/auth/guards/jwtRole.guard'
import { Roles } from '@providers/auth/decorators/roles.decorator'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { z } from 'zod'
import { ZodValidationPipe } from '@shared/pipes/zodValidation'
import { Response } from 'express'
import { AdministratorRole } from '@modules/administrator/entities/Administrator'
import { AdministratorNotFount } from '@modules/administrator/errors/AdministratorNotFound'

const listAttendantQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(5).optional().default(30),
})

type ListAttendantsQuery = z.infer<typeof listAttendantQuerySchema>
const queryValidationPipe = new ZodValidationPipe(listAttendantQuerySchema)

@Controller('/attendants/list')
export class ListAttendantsController {
  constructor(private readonly listAttendantsService: ListAttendantsService) {}

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
    @Query(queryValidationPipe) query: ListAttendantsQuery,
    @Res() res: Response,
  ) {
    const { sub } = user
    const { limit, page } = query

    const response = await this.listAttendantsService.execute({
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

    const { attendants, page: actualPage, size } = response.value

    res.header('X-Total-Count', String(size))
    res.header('X-Page', String(actualPage))

    return res.status(statusCode.Ok).json({
      attendants: attendants.map(AttendantPresenter.toHTTP),
    })
  }
}
