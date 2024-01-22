import { CollaboratorsInMemoryRepository } from '@test/repositories/modules/collaborator/CollaboratorsInMemoryRepository'
import { makeManager } from '@test/factories/modules/manager/makeManager'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { GetCollaboratorService } from './GetCollaborator.service'
import { Collaborator, CollaboratorRole } from '../entities/Collaborator'
import { CollaboratorNotFound } from '../errors/CollaboratorNotFound'

let collaboratorsInMemoryRepository: CollaboratorsInMemoryRepository

let sut: GetCollaboratorService

describe('Login Collaborator', () => {
  beforeEach(() => {
    collaboratorsInMemoryRepository = new CollaboratorsInMemoryRepository()

    sut = new GetCollaboratorService(collaboratorsInMemoryRepository)
  })

  it('should be able to get a collaborator', async () => {
    const collaborator = makeManager(
      {
        email: 'jonas@jonas.com',
      },
      new UniqueEntityId('manager-1'),
    )
    await collaboratorsInMemoryRepository.create(collaborator)

    const response = await sut.execute({
      id: 'manager-1',
    })

    expect(response.isRight()).toBe(true)
    if (response.isRight()) {
      expect(response.value.collaborator).toBeInstanceOf(Collaborator)
      expect(response.value.collaborator.email).toEqual('jonas@jonas.com')
      expect(response.value.collaborator.role).toEqual(CollaboratorRole.MANAGER)
    }
  })

  it('not should be able to create get a inexistent collaborator ', async () => {
    const response = await sut.execute({
      id: 'non-existent-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CollaboratorNotFound)
  })
})
