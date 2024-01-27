import { statusCode } from '@config/statusCode'
import { GetCollaboratorService } from '../services/GetCollaborator.service'
import {
  Controller,
  HttpCode,
  UseGuards,
  Get,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common'
import { ApiKeyGuard } from '@providers/auth/guards/apiKey.guard'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { CollaboratorNotFound } from '../errors/CollaboratorNotFound'
import { MarketNotFound } from '@modules/market/errors/MarketNorFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { CollaboratorPresenter } from '../presenters/CollaboratorPresenter'
import { AuthCollaborator } from '@providers/auth/decorators/authCollaborator.decorator'

@UseGuards(ApiKeyGuard)
@Controller('/collaborators')
export class GetCollaboratorController {
  constructor(
    private readonly getCollaboratorService: GetCollaboratorService,
  ) {}

  @Get()
  @HttpCode(statusCode.Ok)
  @AuthCollaborator()
  async handle(@CurrentLoggedUserDecorator() user: TokenPayloadSchema) {
    const { sub, companyId, marketId } = user

    if (!companyId || !marketId) {
      throw new ForbiddenException(
        'Please verify if you are logged in with a company',
      )
    }

    const response = await this.getCollaboratorService.execute({
      collaboratorId: sub,
      companyId,
      marketId,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case CompanyNotFound:
        case CollaboratorNotFound:
        case MarketNotFound: {
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

    const { collaborator } = response.value

    return {
      collaborator: CollaboratorPresenter.toHTTP(collaborator),
    }
  }
}
