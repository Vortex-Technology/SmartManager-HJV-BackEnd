import { FakeHasher } from '@test/repositories/providers/cryptography/fakeHasher'
import { makeUser } from '@test/factories/modules/user/makeUser'
import { FakeEncrypter } from '@test/repositories/providers/cryptography/fakeEncrypter'
import { FakeEnv } from '@test/config/env/fakeEnv'
import { DayJs } from '@providers/date/implementations/dayJs'
import { EnvService } from '@infra/env/env.service'
import { UserWrongCredentials } from '../errors/UserWrongCredentials'
import { RefreshTokenInMemoryRepository } from '@test/repositories/modules/refreshToken/RefreshTokenInMemoryRepository'
import { UsersInMemoryRepository } from '@test/repositories/modules/user/UsersInMemoryRepository'
import { LoginUserService } from './LoginUser.service'

let usersInMemoryRepository: UsersInMemoryRepository
let fakeHasher: FakeHasher
let fakeEncrypter: FakeEncrypter
let fakeEnv: FakeEnv
let fakeDateProvider: DayJs
let refreshTokenInMemoryRepository: RefreshTokenInMemoryRepository

let sut: LoginUserService

describe('Login User', () => {
  beforeEach(() => {
    usersInMemoryRepository = new UsersInMemoryRepository()
    fakeHasher = new FakeHasher()
    fakeEncrypter = new FakeEncrypter()
    fakeEnv = new FakeEnv()
    fakeDateProvider = new DayJs()
    refreshTokenInMemoryRepository = new RefreshTokenInMemoryRepository()

    sut = new LoginUserService(
      usersInMemoryRepository,
      fakeHasher,
      fakeEncrypter,
      fakeEnv as EnvService,
      fakeDateProvider,
      refreshTokenInMemoryRepository,
    )
  })

  it('should be able to create a new session to user', async () => {
    const passwordHash = await fakeHasher.hash('12345678')

    const user = makeUser({
      email: 'jonas@jonas.com',
      password: passwordHash,
    })

    await usersInMemoryRepository.create(user)

    const response = await sut.execute({
      email: 'jonas@jonas.com',
      password: '12345678',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        }),
      )
    }
  })

  it('not should be able to create a new session to inexistent user', async () => {
    const response = await sut.execute({
      email: 'jonas@jonas.com',
      password: '12345678',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(UserWrongCredentials)
  })

  it("not should be able to create a new session to user if password doesn't match", async () => {
    const passwordHash = await fakeHasher.hash('12345678')

    const user = makeUser({
      email: 'jonas@jonas.com',
      password: passwordHash,
    })

    await usersInMemoryRepository.create(user)

    const response = await sut.execute({
      email: 'jonas@jonas.com',
      password: '123456789',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(UserWrongCredentials)
  })
})
