import { ApiKeyGuard } from '@providers/auth/guards/apiKey.guard'
import {
  AddProductOnOrderBody,
  AddProductOnOrderParams,
  addProductOnOrderBodyValidationPipe,
  addProductOnOrderParamsValidationPipe,
} from '../gateways/AddProductOnOrder.gateway'
import { AddProductOnOrderService } from '../services/AddProductOnOrder.service'
import {
  Body,
  Controller,
  Post,
  HttpCode,
  UseGuards,
  ForbiddenException,
  Param,
  Res,
} from '@nestjs/common'
import { statusCode } from '@config/statusCode'
import { AuthCollaborator } from '@providers/auth/decorators/authCollaborator.decorator'
import { JwtRoleGuard } from '@providers/auth/guards/jwtRole.guard'
import { Roles } from '@providers/auth/decorators/roles.decorator'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { ErrorPresenter } from '@infra/presenters/ErrorPresenter'
import { Response } from 'express'

@UseGuards(ApiKeyGuard)
@Controller('/orders/:orderId/productsVariants')
export class AddProductOnOrderController {
  constructor(
    private readonly addProductOnOrderService: AddProductOnOrderService,
  ) {}

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
    @Body(addProductOnOrderBodyValidationPipe) body: AddProductOnOrderBody,
    @CurrentLoggedUserDecorator() user: TokenPayloadSchema,
    @Param(addProductOnOrderParamsValidationPipe)
    params: AddProductOnOrderParams,
    @Res() res: Response,
  ) {
    const { sub, companyId, marketId } = user
    const { orderId } = params

    if (!companyId || !marketId) {
      throw new ForbiddenException(
        'Please verify if you are logged in with a company',
      )
    }

    const response = await this.addProductOnOrderService.execute({
      ...body,
      collaboratorId: sub,
      companyId,
      marketId,
      orderId,
    })

    if (response.isLeft()) {
      const error = response.value
      return ErrorPresenter.toHTTP(error)
    }

    const { orderProductVariant } = response.value

    res.header(
      'X-Location',
      `/orders/${orderId}/productsVariants/${orderProductVariant.id}`,
    )

    return res.status(statusCode.Created).end()
  }
}
