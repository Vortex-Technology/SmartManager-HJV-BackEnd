import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  Res,
} from '@nestjs/common'
import { statusCode } from 'src/config/statusCode'
import { CreateUserService } from '../services/CreateUser.service'
import { z } from 'zod'
import { ZodValidationPipe } from '@shared/pipes/zodValidation'
import { UserAlreadyExistsWithSameEmail } from '../errors/UserAlreadyExistsWithSameEmail'
import { Response } from 'express'
import { Public } from '@providers/auth/decorators/public.decorator'

const createUserBodySchema = z.object({
  email: z.string().email(),
  name: z.string().min(4).max(30),
  password: z.string().min(8),
  image: z.string().url().optional(),
})

type CreateUserBody = z.infer<typeof createUserBodySchema>
const bodyValidationPipe = new ZodValidationPipe(createUserBodySchema)

@Controller('/users')
export class CreateUserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @Post()
  @Public()
  @HttpCode(statusCode.Created)
  async handle(
    @Body(bodyValidationPipe) body: CreateUserBody,
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
