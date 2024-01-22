import { BadRequestException } from '@nestjs/common'
import { loginCollaboratorBodyValidationPipe } from './LoginCollaborator.gateway'

describe('login collaborator gateway', () => {
  it('should be able to validate body login collaborator', () => {
    const body = {
      email: 'jonas@jonas.com',
      password: 'password',
    }

    const result = loginCollaboratorBodyValidationPipe.transform(body)

    expect(result).toEqual(body)
  })

  it('not should be able to validate body a login collaborator', async () => {
    expect(async () => {
      loginCollaboratorBodyValidationPipe.transform({
        email: 'jonas-jonas.com',
      })
    }).rejects.toBeInstanceOf(BadRequestException)
  })
})
