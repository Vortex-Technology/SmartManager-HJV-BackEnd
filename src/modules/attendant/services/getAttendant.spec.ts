import { AttendantInMemoryRepository } from '@test/repositories/modules/attendant/AttendantInMemoryRepository'
import { makeAttendant } from '@test/factories/modules/attendant/makeAttendant'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { GetAttendantService } from './getAttendant.service'
import { Attendant } from '../entities/Attendant'
import { AttendantNotFount } from '../errors/AttendantNotFound'

let attendantInMemoryRepository: AttendantInMemoryRepository

let sut: GetAttendantService

describe('Get Attendant', () => {
  beforeEach(() => {
    attendantInMemoryRepository = new AttendantInMemoryRepository()

    sut = new GetAttendantService(attendantInMemoryRepository)
  })

  it('should be able to get attendant', async () => {
    const attendant = makeAttendant({}, new UniqueEntityId('1'))
    await attendantInMemoryRepository.create(attendant)

    const response = await sut.execute({ attendantId: '1' })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.attendant).toBeInstanceOf(Attendant)
    }
  })

  it('not should be able to create get an inexistent attendant', async () => {
    const response = await sut.execute({
      attendantId: 'inexistent-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(AttendantNotFount)
  })
})
