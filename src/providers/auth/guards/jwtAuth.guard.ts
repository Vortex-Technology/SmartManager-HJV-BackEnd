import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Observable } from 'rxjs'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import { IS_TO_AUTH_COLLABORATOR_PUBLIC_KEY } from '../decorators/authCollaborator.decorator'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super()
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    const isToAuthCollaborator = this.reflector.getAllAndOverride<boolean>(
      IS_TO_AUTH_COLLABORATOR_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (isPublic || isToAuthCollaborator) {
      return true
    }

    return super.canActivate(context)
  }
}
