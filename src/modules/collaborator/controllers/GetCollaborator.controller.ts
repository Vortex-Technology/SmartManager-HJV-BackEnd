import { statusCode } from '@config/statusCode'
import { GetCollaboratorService } from '../services/GetCollaborator.service'
import {
  Controller,
  HttpCode,
  UseGuards,
  Get,
  ForbiddenException,
} from '@nestjs/common'
import { ApiKeyGuard } from '@providers/auth/guards/apiKey.guard'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { CollaboratorPresenter } from '../presenters/CollaboratorPresenter'
import { AuthCollaborator } from '@providers/auth/decorators/authCollaborator.decorator'
import { ErrorPresenter } from '@infra/presenters/ErrorPresenter'

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
      return ErrorPresenter.toHTTP(error)
    }

    const { collaborator } = response.value

    return {
      collaborator: CollaboratorPresenter.toHTTP(collaborator),
    }
  }
}
