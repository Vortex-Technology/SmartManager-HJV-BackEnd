import {
  BadRequestException,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  UseGuards,
} from '@nestjs/common'
import { statusCode } from 'src/config/statusCode'
import { GetOwnerService } from '../services/getOwner.service'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { OwnerNotFount } from '../errors/OwnerNotFound'
import { OwnerPresenter } from '../presenters/ownerPresenter'
import { JwtRoleGuard } from '@providers/auth/guards/jwtRole.guard'
import { Roles } from '@providers/auth/decorators/roles.decorator'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'

@Controller('/owners')
export class GetOwnerController {
  constructor(private readonly getOwnerService: GetOwnerService) {}

  @Get()
  @HttpCode(statusCode.Ok)
  @UseGuards(JwtRoleGuard)
  @Roles([CollaboratorRole.OWNER])
  async handle(@CurrentLoggedUserDecorator() user: TokenPayloadSchema) {
    const { sub } = user

    const response = await this.getOwnerService.execute({
      ownerId: sub,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case OwnerNotFount: {
          throw new ConflictException(error.message)
        }

        default: {
          throw new BadRequestException(error.message)
        }
      }
    }

    const { owner } = response.value

    return {
      owner: OwnerPresenter.toHTTP(owner),
    }
  }
}
