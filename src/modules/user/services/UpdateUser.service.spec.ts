import { UsersInMemoryRepository } from '@test/repositories/modules/user/UsersInMemoryRepository'
import { UpdateUserService } from './UpdateUser.service'
import { makeUser } from '@test/factories/modules/user/makeUser'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { UserNotFound } from '../errors/UserNotFound'
import { UserAlreadyExistsWithSameEmail } from '../errors/UserAlreadyExistsWithSameEmail'

let usersInMemoryRepository: UsersInMemoryRepository

let sut: UpdateUserService

describe('Update user service', () => {
  beforeEach(() => {
    usersInMemoryRepository = new UsersInMemoryRepository()

    sut = new UpdateUserService(usersInMemoryRepository)
  })

  it('should be able to update user', async () => {
    const user = makeUser({}, new UniqueEntityId('user-1'))
    await usersInMemoryRepository.create(user)

    const response = await sut.execute({
      email: 'jonas@jonas.com',
      name: 'Jonas',
      id: 'user-1',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.user.name).toEqual('Jonas')
      expect(response.value.user.email).toEqual('jonas@jonas.com')
      expect(response.value.user.id.toString()).toEqual('user-1')
    }
  })

  it('not should be able to update user if user not found', async () => {
    const response = await sut.execute({
      email: 'jonas@jonas.com',
      name: 'Jonas',
      id: 'inexistent-user',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(UserNotFound)
  })

  it('not should be able to update user if user already exists with same email', async () => {
    const user = makeUser({}, new UniqueEntityId('user-1'))
    await usersInMemoryRepository.create(user)

    const user2 = makeUser(
      { email: 'johnDie@examplo.com' },
      new UniqueEntityId('user-2'),
    )
    await usersInMemoryRepository.create(user2)

    const response = await sut.execute({
      email: 'johnDie@examplo.com',
      name: 'Jonas',
      id: 'user-1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(UserAlreadyExistsWithSameEmail)
  })
})
