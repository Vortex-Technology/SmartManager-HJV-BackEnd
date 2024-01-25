import { statusCode } from '@config/statusCode'
import {
  CreateMarketBody,
  createMarketBodyValidationPipe,
} from '../gateways/CreateMarket.gateway'
import { CreateMarketService } from '../services/CreateMarket.service'
import {
  Body,
  Controller,
  Post,
  HttpCode,
  BadRequestException,
  NotFoundException,
  UseGuards,
  ConflictException,
  Res,
  ForbiddenException,
} from '@nestjs/common'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { CompanyNotFound } from '@modules/company/errors/CompanyNotFound'
import { ApiKeyGuard } from '@providers/auth/guards/apiKey.guard'
import { Response } from 'express'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { Roles } from '@providers/auth/decorators/roles.decorator'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { JwtRoleGuard } from '@providers/auth/guards/jwtRole.guard'
import { AuthCollaborator } from '@providers/auth/decorators/authCollaborator.decorator'

@UseGuards(ApiKeyGuard)
@Controller('/markets')
export class CreateMarketController {
  constructor(private readonly createMarketService: CreateMarketService) {}

  @Post()
  @AuthCollaborator()
  @HttpCode(statusCode.Created)
  @Roles([CollaboratorRole.MANAGER, CollaboratorRole.OWNER])
  @UseGuards(JwtRoleGuard)
  async handle(
    @Body(createMarketBodyValidationPipe) body: CreateMarketBody,
    @CurrentLoggedUserDecorator() user: TokenPayloadSchema,
    @Res() res: Response,
  ) {
    const { sub: userId, companyId } = user

    if (!companyId) {
      throw new ForbiddenException(
        'Please verify if you are logged in with a company',
      )
    }

    const response = await this.createMarketService.execute({
      ...body,
      companyId,
      creatorId: userId,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case CompanyNotFound: {
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

    const { market } = response.value
    res.header('X-Location', `/markets/${market.id}`)
    return res.status(statusCode.Created).end()
  }
}
