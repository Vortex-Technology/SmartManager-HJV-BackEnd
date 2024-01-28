import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { statusCode } from '@config/statusCode'
import { Public } from '@providers/auth/decorators/public.decorator'
import { RefreshTokenUserService } from '../services/RefreshTokenUser.service'
import {
  RefreshTokenBody,
  refreshTokenBodyValidationPipe,
} from '../gateways/RefreshTokenUser.gateway'
import { ErrorPresenter } from '@infra/presenters/ErrorPresenter'

@Controller('/refreshTokens')
export class RefreshTokenUserController {
  constructor(private readonly refreshTokenService: RefreshTokenUserService) {}

  @Post()
  @HttpCode(statusCode.Created)
  @Public()
  async handle(@Body(refreshTokenBodyValidationPipe) body: RefreshTokenBody) {
    const { refreshToken: _refreshToken } = body

    const response = await this.refreshTokenService.execute({
      refreshToken: _refreshToken,
    })

    if (response.isLeft()) {
      const error = response.value
      return ErrorPresenter.toHTTP(error)
    }

    const { accessToken, refreshToken } = response.value

    return {
      accessToken,
      refreshToken,
    }
  }
}
