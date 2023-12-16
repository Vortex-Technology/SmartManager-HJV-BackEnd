import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { TokenPayloadSchema } from '../strategys/jwtStrategy'

export const CurrentLoggedUserDecorator = createParamDecorator(
  (_: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()

    return request.user as TokenPayloadSchema
  },
)
