import { statusCode } from '@config/statusCode'
import {
  AddCollaboratorMarketBody,
  addCollaboratorMarketBodyValidationPipe,
} from '../gateways/AddCollaboratorMarket.gateway'
import { AddCollaboratorMarketService } from '../services/AddCollaboratorMarket.service'
import {
  Body,
  Controller,
  Post,
  HttpCode,
  UseGuards,
  Res,
  ForbiddenException,
} from '@nestjs/common'
import { ApiKeyGuard } from '@providers/auth/guards/apiKey.guard'
import { AuthCollaborator } from '@providers/auth/decorators/authCollaborator.decorator'
import { Roles } from '@providers/auth/decorators/roles.decorator'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { JwtRoleGuard } from '@providers/auth/guards/jwtRole.guard'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { Response } from 'express'
import { ErrorPresenter } from '@infra/presenters/ErrorPresenter'

@UseGuards(ApiKeyGuard)
@Controller('/markets/collaborators')
export class AddCollaboratorMarketController {
  constructor(
    private readonly addCollaboratorMarketService: AddCollaboratorMarketService,
  ) {}

  @Post()
  @AuthCollaborator()
  @HttpCode(statusCode.Created)
  @Roles([CollaboratorRole.MANAGER, CollaboratorRole.OWNER])
  @UseGuards(JwtRoleGuard)
  async handle(
    @Body(addCollaboratorMarketBodyValidationPipe)
    body: AddCollaboratorMarketBody,
    @CurrentLoggedUserDecorator() user: TokenPayloadSchema,
    @Res() res: Response,
  ) {
    const { sub: userId, companyId, marketId } = user

    if (!companyId || !marketId) {
      throw new ForbiddenException(
        'Please verify if you are logged in with a company',
      )
    }

    const response = await this.addCollaboratorMarketService.execute({
      ...body,
      companyId,
      marketId,
      creatorId: userId,
    })

    if (response.isLeft()) {
      const error = response.value
      return ErrorPresenter.toHTTP(error)
    }

    const { collaborator } = response.value
    res.header('X-Location', `/markets/collaborators/${collaborator.id}`)
    return res.status(statusCode.Created).end()
  }
}
