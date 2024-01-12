import { FakeHasher } from '@test/repositories/providers/cryptography/fakeHasher'
import { makeMaster } from '@test/factories/modules/master/makeMaster'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { CreateOwnerService } from './createOwner.service'
import { OwnersInMemoryRepository } from '@test/repositories/modules/owner/OwnersInMemoryRepository'
import { MastersInMemoryRepository } from '@test/repositories/modules/master/MastersInMemoryRepository'
import { makeOwner } from '@test/factories/modules/owner/makeOwner'
import { OwnerAlreadyExistsWithSameLogin } from '../errors/OwnerAlreadyExistsWithSameLogin'
import { MasterNotFound } from '@modules/master/errors/MasterNotFound'

let ownersInMemoryRepository: OwnersInMemoryRepository
let mastersInMemoryRepository: MastersInMemoryRepository
let fakeHasher: FakeHasher

let sut: CreateOwnerService

describe('Create Owner', () => {
  beforeEach(() => {
    ownersInMemoryRepository = new OwnersInMemoryRepository()
    mastersInMemoryRepository = new MastersInMemoryRepository()

    fakeHasher = new FakeHasher()

    sut = new CreateOwnerService(
      ownersInMemoryRepository,
      mastersInMemoryRepository,
      fakeHasher,
    )
  })

  it('should be able to create a new owner', async () => {
    const master = makeMaster({}, new UniqueEntityId('1'))
    mastersInMemoryRepository.masters.push(master)

    const response = await sut.execute({
      login: 'Jonas!! Álvaro',
      name: 'Jonas',
      password: 'jonas1234',
      masterId: '1',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.owner.name).toEqual('Jonas')
      expect(response.value.owner.login).toEqual('jonas-alvaro')
      expect(response.value.owner.password).not.toEqual('jonas1234')
    }
  })

  it('not should be able create a new owner with the same login', async () => {
    const master = makeMaster({}, new UniqueEntityId('1'))
    const ownerMock = makeOwner({
      login: 'jonas12',
    })

    mastersInMemoryRepository.masters.push(master)
    ownersInMemoryRepository.owners.push(ownerMock)

    const response = await sut.execute({
      login: 'jonas12',
      name: 'jonas',
      password: 'jonas1234',
      masterId: '1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(OwnerAlreadyExistsWithSameLogin)
    expect(ownersInMemoryRepository.owners).toHaveLength(1)
  })

  it('not should be able create a new owner if master not exists', async () => {
    const response = await sut.execute({
      login: 'jonas12',
      name: 'jonas',
      password: 'jonas1234',
      masterId: 'inexistent-creator-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(MasterNotFound)
    expect(ownersInMemoryRepository.owners).toHaveLength(0)
  })
})
