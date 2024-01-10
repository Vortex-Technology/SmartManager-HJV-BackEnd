import { AdministratorInMemoryRepository } from '@test/repositories/modules/administrator/AdministratorInMemoryRepository'
import { makeAdministrator } from '@test/factories/modules/administrator/makeAdministrator'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { Administrator } from '../entities/Administrator'
import { AdministratorNotFount } from '../errors/AdministratorNotFound'
import { ListAdministratorsService } from './listAdministrators.service'

let administratorInMemoryRepository: AdministratorInMemoryRepository

let sut: ListAdministratorsService

describe('List Administrators', () => {
  beforeEach(() => {
    administratorInMemoryRepository = new AdministratorInMemoryRepository()

    sut = new ListAdministratorsService(administratorInMemoryRepository)
  })

  it('should be able to list administrators', async () => {
    const administrator = makeAdministrator({}, new UniqueEntityId('1'))
    await administratorInMemoryRepository.create(administrator)

    for (let i = 0; i < 10; i++) {
      const administrator = makeAdministrator()
      await administratorInMemoryRepository.create(administrator)
    }

    const response = await sut.execute({
      administratorId: '1',
      limit: 30,
      page: 1,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.administrators[0]).toBeInstanceOf(Administrator)
      expect(response.value.administrators).toHaveLength(11)
      expect(response.value.size).toBe(11)
      expect(response.value.page).toBe(1)
    }
  })

  it('should be able to list administrators with pagination', async () => {
    const administrator = makeAdministrator({}, new UniqueEntityId('1'))
    await administratorInMemoryRepository.create(administrator)

    for (let i = 0; i < 10; i++) {
      const administrator = makeAdministrator()
      await administratorInMemoryRepository.create(administrator)
    }

    const response = await sut.execute({
      administratorId: '1',
      page: 2,
      limit: 10,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.administrators[0]).toBeInstanceOf(Administrator)
      expect(response.value.administrators).toHaveLength(1)
      expect(response.value.size).toBe(11)
      expect(response.value.page).toBe(2)
    }
  })

  it('not should be able to create list administrators if administrator not exists', async () => {
    const response = await sut.execute({
      administratorId: 'inexistent-id',
      page: 1,
      limit: 30,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(AdministratorNotFount)
  })
})
