import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  HttpCode,
  Post,
} from '@nestjs/common'
import { ZodValidationPipe } from '@shared/pipes/zodValidation'
import { statusCode } from 'src/config/statusCode'
import { Public } from '@providers/auth/decorators/public.decorator'
import { z } from 'zod'
import { RefreshTokenService } from '../services/refreshToken.service'
import { SessionExpired } from '../errors/SessionExpired'
import { CollaboratorNotFound } from '../errors/CollaboratorNotFound'

const refreshTokenBodySchema = z.object({
  refreshToken: z
    .string()
    .regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/,
      'Invalid refresh token',
    ),
})

type RefreshTokenBody = z.infer<typeof refreshTokenBodySchema>
const bodyValidationPipe = new ZodValidationPipe(refreshTokenBodySchema)

@Controller('/refreshTokens')
export class RefreshTokenController {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  @Post()
  @HttpCode(statusCode.Created)
  @Public()
  async handle(@Body(bodyValidationPipe) body: RefreshTokenBody) {
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
