import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
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
import { Roles } from '@providers/auth/decorators/roles.decorator'
import { Response } from 'express'
import { CreateOwnerService } from '../services/createOwner.service'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { OwnerAlreadyExistsWithSameLogin } from '../errors/OwnerAlreadyExistsWithSameLogin'
import { MasterNotFound } from '@modules/master/errors/MasterNotFound'

const createOwnerBodySchema = z.object({
  name: z.string().min(3).max(190),
  login: z.string().min(4).max(30),
  password: z.string().min(8),
  image: z.string().optional(),
})

type CreateOwnerBody = z.infer<typeof createOwnerBodySchema>
const bodyValidationPipe = new ZodValidationPipe(createOwnerBodySchema)

@Controller('/owners')
export class CreateOwnerController {
  constructor(private readonly createOwnerService: CreateOwnerService) {}

  @Post()
  @HttpCode(statusCode.Created)
  @UseGuards(JwtRoleGuard)
  @Roles([CollaboratorRole.MASTER])
  async handle(
    @Body(bodyValidationPipe) body: CreateOwnerBody,
    @CurrentLoggedUserDecorator() user: TokenPayloadSchema,
    @Res() res: Response,
  ) {
    const { login, name, password, image } = body
    const { sub } = user

    const response = await this.createOwnerService.execute({
      login,
      name,
      password,
      image,
      masterId: sub,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case OwnerAlreadyExistsWithSameLogin:
        case MasterNotFound: {
          throw new ConflictException(error.message)
        }

        default: {
          throw new BadRequestException(error.message)
        }
      }
    }

    const { owner } = response.value

    res.header('Location', `/owners/${owner.id.toString()}`)
    return res.status(statusCode.Created).end()
  }
}
