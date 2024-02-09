import { statusCode } from '@config/statusCode'
import {
  closeOrderParamValidationPipe,
  CloseOrderParams,
} from '../gateways/CloseOrder.gateway'
import { CloseOrderService } from '../services/CloseOrder.service'
import {
  Param,
  Controller,
  Post,
  HttpCode,
  UseGuards,
  ForbiddenException,
  Res,
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
@Controller('/orders/:orderId/close')
export class CloseOrderController {
  constructor(private readonly closeOrderService: CloseOrderService) { }

  @Post()
  @AuthCollaborator()
  @HttpCode(statusCode.Created)
  @UseGuards(JwtRoleGuard)
  @Roles([
    CollaboratorRole.OWNER,
    CollaboratorRole.SELLER,
    CollaboratorRole.MANAGER,
    CollaboratorRole.STOCKIST,
  ])
  async handle(
    @Param(closeOrderParamValidationPipe) params: CloseOrderParams,
    @CurrentLoggedUserDecorator() user: TokenPayloadSchema,
    @Res() res: Response,
  ) {
    const { orderId } = params
    const { sub, marketId, companyId } = user

    if (!marketId || !companyId) {
      throw new ForbiddenException(
        'Please verify if you are logged in with a company',
      )
    }

    const response = await this.closeOrderService.execute({
      orderId,
      marketId,
      companyId,
      collaboratorId: sub,
    })

    if (response.isLeft()) {
      const error = response.value
      return ErrorPresenter.toHTTP(error)
    }

    res.header('X-Location', `/orders/${orderId}`)
    return res.status(statusCode.Created).end()
  }
}
