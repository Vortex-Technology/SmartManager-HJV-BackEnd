import { FakeEncrypter } from '@test/repositories/providers/cryptography/fakeEncrypter'
import { FakeEnv } from '@test/config/env/fakeEnv'
import { DayJs } from '@providers/date/implementations/dayJs'
import { makeRefreshToken } from '@test/factories/modules/refreshToken/makeRefreshToken'
import dayjs from 'dayjs'
import { fakerPT_BR } from '@faker-js/faker'
import { SessionExpired } from '../errors/SessionExpired'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { RefreshTokensInMemoryRepository } from '@test/repositories/modules/refreshToken/RefreshTokensInMemoryRepository'
import { RefreshTokenUserService } from './RefreshTokenUser.service'
import { EnvService } from '@infra/env/Env.service'
import { makeUser } from '@test/factories/modules/user/makeUser'
import { UsersInMemoryRepository } from '@test/repositories/modules/user/UsersInMemoryRepository'
import { UserNotFound } from '@modules/user/errors/UserNotFound'

let fakeEncrypter: FakeEncrypter
let fakeEnv: FakeEnv
let fakeDateProvider: DayJs
let refreshTokensInMemoryRepository: RefreshTokensInMemoryRepository
let usersInMemoryRepository: UsersInMemoryRepository

let sut: RefreshTokenUserService

describe('Refresh Token', () => {
  beforeEach(() => {
    fakeEncrypter = new FakeEncrypter()
    fakeEnv = new FakeEnv()
    fakeDateProvider = new DayJs()
    refreshTokensInMemoryRepository = new RefreshTokensInMemoryRepository()
    usersInMemoryRepository = new UsersInMemoryRepository()

    sut = new RefreshTokenUserService(
      usersInMemoryRepository,
      refreshTokensInMemoryRepository,
      fakeDateProvider,
      fakeDateProvider,
      fakeEncrypter,
      fakeEncrypter,
      fakeEnv as EnvService,
    )
  })

  it('should be able to refresh a token of user', async () => {
    const user = makeUser({}, new UniqueEntityId('user-1'))

    const token = await fakeEncrypter.encrypt({
      sub: 'user-1',
    })

    const refreshToken = makeRefreshToken({
      userId: user.id,
      token,
      expiresIn: fakeDateProvider.addDaysInCurrentDate(1),
    })

    await usersInMemoryRepository.create(user)
    await refreshTokensInMemoryRepository.create(refreshToken)

    const response = await sut.execute({
      refreshToken: token,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        }),
      )
      expect(refreshTokensInMemoryRepository.refreshTokens).toHaveLength(1)

      const tokenDecoded = await fakeEncrypter.decrypt(
        response.value.refreshToken,
      )

      expect(tokenDecoded).toBeTruthy()

      const refreshToken = refreshTokensInMemoryRepository.refreshTokens[0]

      const receivedDate = dayjs(refreshToken.expiresIn)
      const expectedDate = fakeDateProvider.addDaysInCurrentDate(
        fakeEnv.get('USER_REFRESH_EXPIRES_IN'),
      )

      expect(receivedDate.isSame(expectedDate, 'seconds')).toEqual(true)
    }
  })

  it('not should be able to refresh a token if token already expired', async () => {
    const user = makeUser()
    const token = await fakeEncrypter.encrypt({
      sub: user.id.toString(),
    })

    const refreshToken = makeRefreshToken({
      userId: user.id,
      token,
      expiresIn: fakerPT_BR.date.past(),
    })

    await usersInMemoryRepository.create(user)
    await refreshTokensInMemoryRepository.create(refreshToken)

    const response = await sut.execute({
      refreshToken: token,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(SessionExpired)
    expect(refreshTokensInMemoryRepository.refreshTokens).toHaveLength(0)
  })

  it('not should be able to refresh a token if user not exists', async () => {
    const token = await fakeEncrypter.encrypt({
      sub: 'inexistent-id',
    })

    const refreshToken = makeRefreshToken({
      userId: new UniqueEntityId('inexistent-id'),
      token,
      expiresIn: fakerPT_BR.date.past(),
    })

    await refreshTokensInMemoryRepository.create(refreshToken)

    const response = await sut.execute({
      refreshToken: token,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(UserNotFound)
    expect(refreshTokensInMemoryRepository.refreshTokens).toHaveLength(1)
  })

  it('not should be able to refresh a token if token not exist', async () => {
    const user = makeUser()
    const token = await fakeEncrypter.encrypt({
      sub: user.id.toString(),
    })

    await usersInMemoryRepository.create(user)

    const response = await sut.execute({
      refreshToken: token,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(SessionExpired)
    expect(refreshTokensInMemoryRepository.refreshTokens).toHaveLength(0)
  })

  it('should be able to delete permanently all tokens of user when a new is created', async () => {
    const user = makeUser()
    const token = await fakeEncrypter.encrypt({
      sub: user.id.toString(),
    })

    for (let i = 0; i <= 10; i++) {
      const refreshToken = makeRefreshToken({
        userId: user.id,
        token,
        expiresIn: fakeDateProvider.addDaysInCurrentDate(1),
      })

      await refreshTokensInMemoryRepository.create(refreshToken)
    }

    await usersInMemoryRepository.create(user)

    const response = await sut.execute({
      refreshToken: token,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        }),
      )
      expect(refreshTokensInMemoryRepository.refreshTokens).toHaveLength(1)

      const tokenDecoded = await fakeEncrypter.decrypt(
        response.value.refreshToken,
      )

      expect(tokenDecoded).toBeTruthy()

      const refreshToken = refreshTokensInMemoryRepository.refreshTokens[0]

      const receivedDate = dayjs(refreshToken.expiresIn)
      const expectedDate = fakeDateProvider.addDaysInCurrentDate(
        fakeEnv.get('USER_REFRESH_EXPIRES_IN'),
      )

      expect(receivedDate.isSame(expectedDate, 'seconds')).toEqual(true)
    }
  })
})
