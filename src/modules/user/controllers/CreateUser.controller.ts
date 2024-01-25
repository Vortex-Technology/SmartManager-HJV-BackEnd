import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  Res,
} from '@nestjs/common'
import { statusCode } from '@config/statusCode'
import { CreateUserService } from '../services/CreateUser.service'

import { UserAlreadyExistsWithSameEmail } from '../errors/UserAlreadyExistsWithSameEmail'
import { Response } from 'express'
import { Public } from '@providers/auth/decorators/public.decorator'
import {
  CreateUserBody,
  createUserBodyValidationPipe,
} from '../gateways/CreateUser.gateway'

@Controller('/users')
export class CreateUserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @Post()
  @Public()
  @HttpCode(statusCode.Created)
  async handle(
    @Body(createUserBodyValidationPipe) body: CreateUserBody,
    @Res() res: Response,
  ) {
    const { email, name, password, image } = body

    const response = await this.createUserService.execute({
      email,
      name,
      password,
      image,
    })

    if (response.isLeft()) {
      const error = response.value

      switch (error.constructor) {
        case UserAlreadyExistsWithSameEmail: {
          throw new ConflictException(error.message)
        }

        default: {
          throw new BadRequestException(error.message)
        }
      }
    }

    const { user } = response.value

    res.header('X-Location', `/users/${user.id}`)
    return res.status(statusCode.Created).end()
  }
}
