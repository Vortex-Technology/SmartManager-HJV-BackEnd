import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { SetMetadata } from '@nestjs/common'

export const Roles = (roles: CollaboratorRole[]) => SetMetadata('roles', roles)
