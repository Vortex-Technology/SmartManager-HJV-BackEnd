import {
  BadRequestException,
  ConflictException,
  Controller,
  Get,
  HttpCode,
} from '@nestjs/common'
import { statusCode } from 'src/config/statusCode'
import { GetAdministratorService } from '../services/getAdministrator.service'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { AdministratorNotFount } from '../errors/AdministratorNotFound'
import { AdministratorPresenter } from '../presenters/administratorPresenter'

@Controller('/administrator')
export class GetAdministratorController {
  constructor(
    private readonly getAdministratorService: GetAdministratorService,
  ) {}

  @Get()
  @HttpCode(statusCode.Ok)
  async handle(@CurrentLoggedUserDecorator() user: TokenPayloadSchema) {
    const { sub } = user

    const response = await this.getAdministratorService.execute({
      administratorId: sub,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case AdministratorNotFount: {
          throw new ConflictException(error.message)
        }

        default: {
          throw new BadRequestException(error.message)
        }
      }
    }

    const { administrator } = response.value

    return {
      administrator: AdministratorPresenter.toHTTP(administrator),
    }
  }
}
