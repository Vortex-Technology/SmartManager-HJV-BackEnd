import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Observable } from 'rxjs'

@Injectable()
export class JwtRoleGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super()
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const allowedRoles = this.reflector.get<CollaboratorRole[]>(
      'roles',
      context.getHandler(),
    )

    if (!allowedRoles) {
      return false
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user
    const hasRole = allowedRoles.includes(user.role)

    return hasRole
  }
}
