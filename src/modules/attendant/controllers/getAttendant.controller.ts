import {
  BadRequestException,
  ConflictException,
  Controller,
  Get,
  HttpCode,
} from '@nestjs/common'
import { statusCode } from 'src/config/statusCode'
import { GetAttendantService } from '../services/getAttendant.service'
import { CurrentLoggedUserDecorator } from '@providers/auth/decorators/currentLoggedUser.decorator'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { AttendantNotFount } from '../errors/AttendantNotFound'
import { AttendantPresenter } from '../presenters/attendantPresenter'

@Controller('/attendant')
export class GetAttendantController {
  constructor(private readonly getAttendantService: GetAttendantService) {}

  @Get()
  @HttpCode(statusCode.Ok)
  async handle(@CurrentLoggedUserDecorator() user: TokenPayloadSchema) {
    const { sub } = user

    const response = await this.getAttendantService.execute({
      attendantId: sub,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case AttendantNotFount: {
          throw new ConflictException(error.message)
        }

        default: {
          throw new BadRequestException(error.message)
        }
      }
    }

    const { attendant } = response.value

    return {
      attendant: AttendantPresenter.toHTTP(attendant),
    }
  }
}
