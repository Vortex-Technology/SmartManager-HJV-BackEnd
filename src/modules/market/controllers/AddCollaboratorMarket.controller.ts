import { statusCode } from '@config/statusCode'
import {
  AddCollaboratorMarketBody,
  AddCollaboratorMarketParams,
  addCollaboratorMarketBodyValidationPipe,
  addCollaboratorMarketParamsValidationPipe,
} from '../gateways/AddCollaboratorMarket.gateway'
import { AddCollaboratorMarketService } from '../services/AddCollaboratorMarket.service'
import {
  Body,
  Controller,
  Post,
  HttpCode,
  UseGuards,
  Param,
  Res,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import { ApiKeyGuard } from '@providers/auth/guards/apiKey.guard'
import { AuthCollaborator } from '@providers/auth/decorators/authCollaborator.decorator'
import { Roles } from '@providers/auth/decorators/roles.decorator'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { JwtRoleGuard } from '@providers/auth/guards/jwtRole.guard'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { MarketNotFound } from '../errors/MarketNorFound'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { Response } from 'express'

@UseGuards(ApiKeyGuard)
@Controller('/companies/:companyId/markets/:marketId/collaborators')
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
    @Param(addCollaboratorMarketParamsValidationPipe)
    params: AddCollaboratorMarketParams,
    @CurrentLoggedUserDecorator() user: TokenPayloadSchema,
    @Res() res: Response,
  ) {
    const { sub: userId } = user
    const { companyId, marketId } = params

    const response = await this.addCollaboratorMarketService.execute({
      ...body,
      companyId,
      marketId,
      creatorId: userId,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case CompanyNotFound:
        case MarketNotFound: {
          throw new NotFoundException(error.message)
        }

        case CollaboratorNotFound: {
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
    res.header(
      'X-Location',
      `/companies/${companyId}/markets/${marketId}/collaborators/${collaborator.id}`,
    )
    return res.status(statusCode.Created).end()
  }
}
