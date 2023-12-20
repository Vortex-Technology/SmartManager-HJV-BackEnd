import { AdministratorInMemoryRepository } from '@test/repositories/modules/administrator/AdministratorInMemoryRepository'
import { makeAdministrator } from '@test/factories/modules/administrator/makeAdministrator'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { GetAdministratorService } from './getAdministrator.service'
import { Administrator } from '../entities/Administrator'
import { AdministratorNotFount } from '../errors/AdministratorNotFound'

let administratorInMemoryRepository: AdministratorInMemoryRepository

let sut: GetAdministratorService

describe('Get Administrator', () => {
  beforeEach(() => {
    administratorInMemoryRepository = new AdministratorInMemoryRepository()

    sut = new GetAdministratorService(administratorInMemoryRepository)
  })

  it('should be able to get administrator', async () => {
    const administrator = makeAdministrator({}, new UniqueEntityId('1'))
    await administratorInMemoryRepository.create(administrator)

    const response = await sut.execute({ administratorId: '1' })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.administrator).toBeInstanceOf(Administrator)
    }
  })

  it('not should be able to create get an inexistent administrator', async () => {
    const response = await sut.execute({
      administratorId: 'inexistent-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(AdministratorNotFount)
  })
})
