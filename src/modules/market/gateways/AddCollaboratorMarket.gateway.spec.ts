import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { addCollaboratorMarketBodyValidationPipe } from './AddCollaboratorMarket.gateway'
import { BadRequestException } from '@nestjs/common'

describe('Add collaborator market gateway', async () => {
  it('should be able to validate body of add collaborator market', async () => {
    const body = {
      name: 'john Doe',
      image: 'image-example.jpg',
      email: 'john@example.com',
      password: 'password',
      actualRemuneration: 1000,
      collaboratorRole: CollaboratorRole.MANAGER,
    }
    const result = addCollaboratorMarketBodyValidationPipe.transform(body)

    expect(result).toEqual(body)
  })

  it('not should be able  to pass in validation  body of add collaborator market', async () => {
    expect(async () => {
      addCollaboratorMarketBodyValidationPipe.transform({
        CollaboratorRole: 'wrong-role',
      })
    })
      .rejects.toBeInstanceOf(BadRequestException)
      .catch((err) => {
        throw err
      })
  })
})
