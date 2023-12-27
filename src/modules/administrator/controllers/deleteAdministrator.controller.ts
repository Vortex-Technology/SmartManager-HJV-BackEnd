import {
  BadRequestException,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common'
import { ZodValidationPipe } from '@shared/pipes/zodValidation'
import { statusCode } from 'src/config/statusCode'
import { z } from 'zod'
import { DeleteAdministratorService } from '../services/deleteAdministrator.service'
import { AdministratorRole } from '../entities/Administrator'
import { JwtRoleGuard } from '@providers/auth/guards/jwtRole.guard'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { AdministratorNotFount } from '../errors/AdministratorNotFound'
import { Roles } from '@providers/auth/decorators/roles.decorator'
import { AdministratorToExcludeNotFound } from '../errors/AdministratorToExcludeNotFound'

const deleteAdministratorParamsSchema = z.object({
  id: z.string().uuid(),
})

type DeleteAdministratorParams = z.infer<typeof deleteAdministratorParamsSchema>
const paramsValidationPipe = new ZodValidationPipe(
  deleteAdministratorParamsSchema,
)

@Controller('/administrator/:id')
export class DeleteAdministratorController {
  constructor(
    private readonly deleteAdministratorService: DeleteAdministratorService,
  ) {}

  @Delete()
  @HttpCode(statusCode.NoContent)
  @UseGuards(JwtRoleGuard)
  @Roles([AdministratorRole.MASTER, AdministratorRole.FULL_ACCESS])
  async handle(
    @Param(paramsValidationPipe) params: DeleteAdministratorParams,
    @CurrentLoggedUserDecorator() user: TokenPayloadSchema,
  ) {
    const { id } = params
    const { sub } = user

    const response = await this.deleteAdministratorService.execute({
      administratorId: id,
      excluderId: sub,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case AdministratorToExcludeNotFound: {
          throw new NotFoundException(error.message)
        }

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

    return {}
  }
}
