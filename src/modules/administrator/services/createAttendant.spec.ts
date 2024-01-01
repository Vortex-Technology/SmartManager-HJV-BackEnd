import { CreateAttendantService } from './createAttendant.service'
import { FakeHasher } from '@test/repositories/providers/cryptography/fakeHasher'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { AdministratorInMemoryRepository } from '@test/repositories/modules/administrator/AdministratorInMemoryRepository'
import { AttendantInMemoryRepository } from '@test/repositories/modules/attendant/AttendantInMemoryRepository'
import { AttendantAlreadyExistsWithSame } from '@modules/attendant/errors/AttendantAlreadyExistsWithSame'
import { AdministratorRole } from '../entities/Administrator'
import { makeAdministrator } from '@test/factories/modules/administrator/makeAdministrator'
import { makeAttendant } from '@test/factories/modules/attendant/makeAttendant'
import { AdministratorNotFount } from '../errors/AdministratorNotFound'

let administratorInMemoryRepository: AdministratorInMemoryRepository
let attendantInMemoryRepository: AttendantInMemoryRepository
let fakeHasher: FakeHasher

let sut: CreateAttendantService

describe('Create Attendant', () => {
  beforeEach(() => {
    administratorInMemoryRepository = new AdministratorInMemoryRepository()
    attendantInMemoryRepository = new AttendantInMemoryRepository()
    fakeHasher = new FakeHasher()

    sut = new CreateAttendantService(
      administratorInMemoryRepository,
      attendantInMemoryRepository,
      fakeHasher,
    )
  })

  it('should be able to create a new attendant', async () => {
    const creator = makeAdministrator(
      {
        role: AdministratorRole.MASTER,
      },
      new UniqueEntityId('1'),
    )

    await administratorInMemoryRepository.create(creator)

    const response = await sut.execute({
      login: 'Jonas!! Álvaro',
      name: 'Jonas',
      password: 'jonas1234',
      creatorId: '1',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.attendant.name).toEqual('Jonas')
      expect(response.value.attendant.login).toEqual('jonas-alvaro')
      expect(response.value.attendant.password).not.toEqual('jonas1234')
    }
  })

  it('not should be able create a new attendant with the same login', async () => {
    const creator = makeAdministrator(
      {
        role: AdministratorRole.MASTER,
      },
      new UniqueEntityId('1'),
    )

    const attendantMock1 = makeAttendant({
      login: 'jonas12',
    })

    await administratorInMemoryRepository.create(creator)
    await attendantInMemoryRepository.create(attendantMock1)

    const response = await sut.execute({
      login: 'jonas12',
      name: 'jonas',
      password: 'jonas1234',
      creatorId: '1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(AttendantAlreadyExistsWithSame)
    expect(attendantInMemoryRepository.attendants).toHaveLength(1)
  })

  it('not should be able create a new attendant if creator not a MASTER, FULL_ACCESS or EDITOR adm', async () => {
    const creator = makeAdministrator(
      {
        role: AdministratorRole.VIEWER,
      },
      new UniqueEntityId('1'),
    )

    await administratorInMemoryRepository.create(creator)

    const response = await sut.execute({
      login: 'jonas12',
      name: 'jonas',
      password: 'jonas1234',
      creatorId: '1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
    expect(attendantInMemoryRepository.attendants).toHaveLength(0)
  })

  it('not should be able create a new attendant if creator not exists', async () => {
    const response = await sut.execute({
      login: 'jonas12',
      name: 'jonas',
      password: 'jonas1234',
      creatorId: 'inexistent-creator-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(AdministratorNotFount)
    expect(attendantInMemoryRepository.attendants).toHaveLength(0)
  })
})
