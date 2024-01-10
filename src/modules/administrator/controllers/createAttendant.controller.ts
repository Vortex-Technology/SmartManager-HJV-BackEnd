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
import { CreateAttendantService } from '../services/createAttendant.service'
import { JwtRoleGuard } from '@providers/auth/guards/jwtRole.guard'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { Roles } from '@providers/auth/decorators/roles.decorator'
import { Response } from 'express'
import { AdministratorRole } from '../entities/Administrator'
import { AttendantAlreadyExistsWithSame } from '@modules/attendant/errors/AttendantAlreadyExistsWithSame'
import { AdministratorNotFount } from '../errors/AdministratorNotFound'

const createAttendantBodySchema = z.object({
  name: z.string().min(3).max(190),
  login: z.string().min(4).max(30),
  password: z.string().min(8),
})

type CreateAttendantBody = z.infer<typeof createAttendantBodySchema>
const bodyValidationPipe = new ZodValidationPipe(createAttendantBodySchema)

@Controller('/attendants')
export class CreateAttendantController {
  constructor(
    private readonly createAttendantService: CreateAttendantService,
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
    @Body(bodyValidationPipe) body: CreateAttendantBody,
    @CurrentLoggedUserDecorator() user: TokenPayloadSchema,
    @Res() res: Response,
  ) {
    const { login, name, password } = body
    const { sub } = user

    const response = await this.createAttendantService.execute({
      login,
      name,
      password,
      creatorId: sub,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case AttendantAlreadyExistsWithSame:
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

    const { attendant } = response.value

    res.header('Location', `/attendants/${attendant.id.toString()}`)
    return res.status(statusCode.Created).end()
  }
}
