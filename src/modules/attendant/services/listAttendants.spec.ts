import { AttendantInMemoryRepository } from '@test/repositories/modules/attendant/AttendantInMemoryRepository'
import { makeAttendant } from '@test/factories/modules/attendant/makeAttendant'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { Attendant } from '../entities/Attendant'
import { ListAttendantsService } from './listAttendants.service'
import { AdministratorInMemoryRepository } from '@test/repositories/modules/administrator/AdministratorInMemoryRepository'
import { makeAdministrator } from '@test/factories/modules/administrator/makeAdministrator'
import { AdministratorNotFount } from '@modules/administrator/errors/AdministratorNotFound'

let attendantInMemoryRepository: AttendantInMemoryRepository
let administratorInMemoryRepository: AdministratorInMemoryRepository

let sut: ListAttendantsService

describe('List Attendants', () => {
  beforeEach(() => {
    attendantInMemoryRepository = new AttendantInMemoryRepository()
    administratorInMemoryRepository = new AdministratorInMemoryRepository()

    sut = new ListAttendantsService(
      attendantInMemoryRepository,
      administratorInMemoryRepository,
    )
  })

  it('should be able to list attendants', async () => {
    const administrator = makeAdministrator({}, new UniqueEntityId('1'))
    await administratorInMemoryRepository.create(administrator)

    for (let i = 0; i < 10; i++) {
      const attendant = makeAttendant()
      await attendantInMemoryRepository.create(attendant)
    }

    const response = await sut.execute({
      administratorId: '1',
      limit: 30,
      page: 1,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.attendants[0]).toBeInstanceOf(Attendant)
      expect(response.value.attendants).toHaveLength(10)
      expect(response.value.size).toBe(10)
      expect(response.value.page).toBe(1)
    }
  })

  it('should be able to list attendants with pagination', async () => {
    const administrator = makeAdministrator({}, new UniqueEntityId('1'))
    await administratorInMemoryRepository.create(administrator)

    for (let i = 0; i < 11; i++) {
      const attendant = makeAttendant()
      await attendantInMemoryRepository.create(attendant)
    }

    const response = await sut.execute({
      administratorId: '1',
      page: 2,
      limit: 10,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.attendants[0]).toBeInstanceOf(Attendant)
      expect(response.value.attendants).toHaveLength(1)
      expect(response.value.size).toBe(11)
      expect(response.value.page).toBe(2)
    }
  })

  it('not should be able to create list attendants if attendant not exists', async () => {
    const response = await sut.execute({
      administratorId: 'inexistent-id',
      page: 1,
      limit: 30,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(AdministratorNotFount)
  })
})
