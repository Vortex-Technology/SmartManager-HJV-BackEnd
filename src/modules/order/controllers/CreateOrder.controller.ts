import { statusCode } from '@config/statusCode'
import { CreateOrderService } from '../services/CreateOrder.service'
import {
  Controller,
  Post,
  HttpCode,
  UseGuards,
  Res,
  ForbiddenException,
} from '@nestjs/common'
import { ApiKeyGuard } from '@providers/auth/guards/apiKey.guard'
import { JwtRoleGuard } from '@providers/auth/guards/jwtRole.guard'
import { Roles } from '@providers/auth/decorators/roles.decorator'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { AuthCollaborator } from '@providers/auth/decorators/authCollaborator.decorator'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { ErrorPresenter } from '@infra/presenters/ErrorPresenter'
import { Response } from 'express'

@UseGuards(ApiKeyGuard)
@Controller('/orders')
export class CreateOrderController {
  constructor(private readonly createOrderService: CreateOrderService) {}

  @Post()
  @AuthCollaborator()
  @HttpCode(statusCode.Created)
  @UseGuards(JwtRoleGuard)
  @Roles([
    CollaboratorRole.MANAGER,
    CollaboratorRole.OWNER,
    CollaboratorRole.SELLER,
    CollaboratorRole.STOCKIST,
  ])
  async handle(
    @CurrentLoggedUserDecorator() user: TokenPayloadSchema,
    @Res() res: Response,
  ) {
    const { sub, companyId, marketId } = user

    if (!companyId || !marketId) {
      throw new ForbiddenException(
        'Please verify if you are logged in with a company',
      )
    }

    const response = await this.createOrderService.execute({
      collaboratorId: sub,
      companyId,
      marketId,
    })

    if (response.isLeft()) {
      const error = response.value
      return ErrorPresenter.toHTTP(error)
    }

    const { order } = response.value

    res.header('X-Location', `/orders/${order.id}`)
    return res.status(statusCode.Created).end()
  }
}
