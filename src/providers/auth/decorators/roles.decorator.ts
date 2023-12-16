import { AdministratorRole } from '@modules/administrator/entities/Administrator'
import { SetMetadata } from '@nestjs/common'

export const Roles = (roles: AdministratorRole[]) => SetMetadata('roles', roles)
