import { BadRequestException } from '@nestjs/common'
import { loginCollaboratorBodyValidationPipe } from './loginCollaborator.gateway'

describe('login collaborator gateway', () => {
  it('should be able to validate body login collaborator', () => {
    const body = {
      login: 'user',
      password: 'password',
    }

    const result = loginCollaboratorBodyValidationPipe.transform(body)

    expect(result).toEqual(body)
  })

  it('not should be able to validate body a login collaborator', async () => {
    expect(async () => {
      loginCollaboratorBodyValidationPipe.transform({
        login: 'wrong-user',
      })
    }).rejects.toBeInstanceOf(BadRequestException)
  })
})
