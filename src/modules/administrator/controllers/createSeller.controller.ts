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
import { CreateSellerService } from '../services/createSeller.service'
import { JwtRoleGuard } from '@providers/auth/guards/jwtRole.guard'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { Roles } from '@providers/auth/decorators/roles.decorator'
import { Response } from 'express'
import { AdministratorRole } from '../entities/Administrator'
import { SellerAlreadyExistsWithSame } from '@modules/seller/errors/SellerAlreadyExistsWithSame'
import { AdministratorNotFount } from '../errors/AdministratorNotFound'

const createSellerBodySchema = z.object({
  name: z.string().min(3).max(190),
  login: z.string().min(4).max(30),
  password: z.string().min(8),
})

type CreateSellerBody = z.infer<typeof createSellerBodySchema>
const bodyValidationPipe = new ZodValidationPipe(createSellerBodySchema)

@Controller('/sellers')
export class CreateSellerController {
  constructor(private readonly createSellerService: CreateSellerService) {}

  @Post()
  @HttpCode(statusCode.Created)
  @UseGuards(JwtRoleGuard)
  @Roles([
    AdministratorRole.MASTER,
    AdministratorRole.FULL_ACCESS,
    AdministratorRole.EDITOR,
  ])
  async handle(
    @Body(bodyValidationPipe) body: CreateSellerBody,
    @CurrentLoggedUserDecorator() user: TokenPayloadSchema,
    @Res() res: Response,
  ) {
    const { login, name, password } = body
    const { sub } = user

    const response = await this.createSellerService.execute({
      login,
      name,
      password,
      creatorId: sub,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case SellerAlreadyExistsWithSame:
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

    const { seller } = response.value

    res.header('Location', `/sellers/${seller.id.toString()}`)
    return res.status(statusCode.Created).end()
  }
}
