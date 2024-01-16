import { makeUser } from '@test/factories/modules/user/makeUser'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { User } from '../entities/User'
import { UserNotFount } from '../errors/UserNotFound'
import { UsersInMemoryRepository } from '@test/repositories/modules/user/UsersInMemoryRepository'
import { GetUserService } from './GetUser.service'

let usersInMemoryRepository: UsersInMemoryRepository

let sut: GetUserService

describe('Get User', () => {
  beforeEach(() => {
    usersInMemoryRepository = new UsersInMemoryRepository()

    sut = new GetUserService(usersInMemoryRepository)
  })

  it('should be able to get user', async () => {
    const user = makeUser({}, new UniqueEntityId('1'))
    await usersInMemoryRepository.create(user)

    const response = await sut.execute({ userId: '1' })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.user).toBeInstanceOf(User)
    }
  })

  it('not should be able to create get an inexistent user', async () => {
    const response = await sut.execute({
      userId: 'inexistent-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(UserNotFount)
  })
})
