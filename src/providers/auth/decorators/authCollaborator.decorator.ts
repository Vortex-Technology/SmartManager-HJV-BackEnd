import { SetMetadata } from '@nestjs/common'

export const IS_TO_AUTH_COLLABORATOR_PUBLIC_KEY = 'isToAuthCollaborator'
export const AuthCollaborator = () =>
  SetMetadata(IS_TO_AUTH_COLLABORATOR_PUBLIC_KEY, true)
