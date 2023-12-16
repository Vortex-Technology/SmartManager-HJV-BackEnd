import { AdministratorInMemoryRepository } from '@test/repositories/modules/administrator/AdministratorInMemoryRepository'
import { CreateAdministratorService } from './createAdministrator.service'
import { FakeHasher } from '@test/repositories/providers/cryptography/fakeHasher'
import { makeAdministrator } from '@test/factories/modules/administrator/makeAdministrator'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { AdministratorRole } from '../entities/Administrator'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { AdministratorAlreadyExistsWithSame } from '../errors/AdministratorAlreadyExistsWithSame'
import { AdministratorNotFount } from '../errors/AdministratorNotFound'

let administratorInMemoryRepository: AdministratorInMemoryRepository
let fakeHasher: FakeHasher

let sut: CreateAdministratorService

describe('Create Administrator', () => {
  beforeEach(() => {
    administratorInMemoryRepository = new AdministratorInMemoryRepository()
    fakeHasher = new FakeHasher()

    sut = new CreateAdministratorService(
      administratorInMemoryRepository,
      fakeHasher,
    )
  })

  it('should be able to create a new administrator', async () => {
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
      expect(response.value.administrator.name).toEqual('Jonas')
      expect(response.value.administrator.login).toEqual('jonas-alvaro')
      expect(response.value.administrator.password).not.toEqual('jonas1234')
    }
  })

  it('not should be able create a new administrator with the same login', async () => {
    const creator = makeAdministrator(
      {
        role: AdministratorRole.MASTER,
      },
      new UniqueEntityId('1'),
    )

    const administratorMock1 = makeAdministrator({
      login: 'jonas12',
    })

    await administratorInMemoryRepository.create(creator)
    await administratorInMemoryRepository.create(administratorMock1)

    const response = await sut.execute({
      login: 'jonas12',
      name: 'jonas',
      password: 'jonas1234',
      creatorId: '1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(AdministratorAlreadyExistsWithSame)
    expect(administratorInMemoryRepository.administrators).toHaveLength(2)
  })

  it('not should be able create a new administrator if creator not a MASTER or FULL_ACCESS adm', async () => {
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
    expect(administratorInMemoryRepository.administrators).toHaveLength(1)
  })

  it('not should be able create a new administrator if creator not exists', async () => {
    const response = await sut.execute({
      login: 'jonas12',
      name: 'jonas',
      password: 'jonas1234',
      creatorId: 'inexistent-creator-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(AdministratorNotFount)
    expect(administratorInMemoryRepository.administrators).toHaveLength(0)
  })
})
