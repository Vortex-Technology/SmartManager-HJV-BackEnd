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
import { CreateAdministratorService } from '../services/createAdministrator.service'
import { AdministratorRole } from '../entities/Administrator'
import { JwtRoleGuard } from '@providers/auth/guards/jwtRole.guard'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { AdministratorAlreadyExistsWithSame } from '../errors/AdministratorAlreadyExistsWithSame'
import { AdministratorNotFount } from '../errors/AdministratorNotFound'
import { Roles } from '@providers/auth/decorators/roles.decorator'
import { Response } from 'express'

const createAdministratorBodySchema = z.object({
  name: z.string().min(3).max(190),
  login: z.string().min(4).max(30),
  password: z.string().min(8),
  image: z.string().optional(),
  role: z.enum(['FULL_ACCESS', 'EDITOR', 'VIEWER']).optional(),
})

type CreateAdministratorBody = z.infer<typeof createAdministratorBodySchema>
const bodyValidationPipe = new ZodValidationPipe(createAdministratorBodySchema)

@Controller('/administrators')
export class CreateAdministratorController {
  constructor(
    private readonly createAdministratorService: CreateAdministratorService,
  ) {}

  @Post()
  @HttpCode(statusCode.Created)
  @UseGuards(JwtRoleGuard)
  @Roles([AdministratorRole.MASTER, AdministratorRole.FULL_ACCESS])
  async handle(
    @Body(bodyValidationPipe) body: CreateAdministratorBody,
    @CurrentLoggedUserDecorator() user: TokenPayloadSchema,
    @Res() res: Response,
  ) {
    const { login, name, password, image, role } = body
    const { sub } = user

    const response = await this.createAdministratorService.execute({
      login,
      name,
      password,
      image,
      creatorId: sub,
      role,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case AdministratorAlreadyExistsWithSame:
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

    const { administrator } = response.value

    res.header('Location', `/administrators/${administrator.id.toString()}`)
    return res.status(statusCode.Created).end()
  }
}
