import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  HttpCode,
  Post,
} from '@nestjs/common'
import { statusCode } from 'src/config/statusCode'
import { Public } from '@providers/auth/decorators/public.decorator'
import { SessionExpired } from '../errors/SessionExpired'
import { RefreshTokenUserService } from '../services/RefreshTokenUser.service'
import { CollaboratorNotFound } from '@modules/collaborator/errors/CollaboratorNotFound'
import {
  RefreshTokenBody,
  refreshTokenBodyValidationPipe,
} from '../gateways/RefreshTokenUser.gateway'

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

      switch (error.constructor) {
        case CollaboratorNotFound: {
          throw new ConflictException(error.message)
        }

        case SessionExpired: {
          throw new ForbiddenException(error.message)
        }

        default: {
          throw new BadRequestException(error.message)
        }
      }
    }

    const { accessToken, refreshToken } = response.value

    return {
      accessToken,
      refreshToken,
    }
  }
}
