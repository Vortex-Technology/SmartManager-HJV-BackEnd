import { FakeHasher } from '@test/repositories/providers/cryptography/fakeHasher'
import { makeMaster } from '@test/factories/modules/master/makeMaster'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { MastersInMemoryRepository } from '@test/repositories/modules/master/MastersInMemoryRepository'
import { CreateUserService } from './CreateUser.service'
import { UsersInMemoryRepository } from '@test/repositories/modules/user/UsersInMemoryRepository'
import { makeUser } from '@test/factories/modules/user/makeUser'
import { UserAlreadyExistsWithSameEmail } from '../errors/UserAlreadyExistsWithSameEmail'

let usersInMemoryRepository: UsersInMemoryRepository
let mastersInMemoryRepository: MastersInMemoryRepository
let fakeHasher: FakeHasher

let sut: CreateUserService

describe('Create User', () => {
  beforeEach(() => {
    usersInMemoryRepository = new UsersInMemoryRepository()
    mastersInMemoryRepository = new MastersInMemoryRepository()

    fakeHasher = new FakeHasher()

    sut = new CreateUserService(fakeHasher, usersInMemoryRepository)
  })

  it('should be able to create a new user', async () => {
    const master = makeMaster({}, new UniqueEntityId('1'))
    mastersInMemoryRepository.masters.push(master)

    const response = await sut.execute({
      email: 'jonas@jonas.com',
      name: 'Jonas',
      password: 'jonas1234',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.user.name).toEqual('Jonas')
      expect(response.value.user.email).toEqual('jonas@jonas.com')
      expect(response.value.user.password).not.toEqual('jonas1234')
    }
  })

  it('not should be able create a new user with the same email', async () => {
    const master = makeMaster({}, new UniqueEntityId('1'))
    const userMock = makeUser({
      email: 'jonas@jonas.com',
    })

    mastersInMemoryRepository.masters.push(master)
    usersInMemoryRepository.users.push(userMock)

    const response = await sut.execute({
      email: 'jonas@jonas.com',
      name: 'jonas',
      password: 'jonas1234',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(UserAlreadyExistsWithSameEmail)
    expect(usersInMemoryRepository.users).toHaveLength(1)
  })
})
