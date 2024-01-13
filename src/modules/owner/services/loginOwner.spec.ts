import { LoginOwnerService } from './loginOwner.service'
import { FakeHasher } from '@test/repositories/providers/cryptography/fakeHasher'
import { makeOwner } from '@test/factories/modules/owner/makeOwner'
import { FakeEncrypter } from '@test/repositories/providers/cryptography/fakeEncrypter'
import { FakeEnv } from '@test/config/env/fakeEnv'
import { DayJs } from '@providers/date/implementations/dayJs'
import { EnvService } from '@infra/env/env.service'
import { OwnerWrongCredentials } from '../errors/OwnerWrongCredentials'
import { RefreshTokenInMemoryRepository } from '@test/repositories/modules/refreshToken/RefreshTokenInMemoryRepository'
import { OwnersInMemoryRepository } from '@test/repositories/modules/owner/OwnersInMemoryRepository'

let ownersInMemoryRepository: OwnersInMemoryRepository
let fakeHasher: FakeHasher
let fakeEncrypter: FakeEncrypter
let fakeEnv: FakeEnv
let fakeDateProvider: DayJs
let refreshTokenInMemoryRepository: RefreshTokenInMemoryRepository

let sut: LoginOwnerService

describe('Login Owner', () => {
  beforeEach(() => {
    ownersInMemoryRepository = new OwnersInMemoryRepository()
    fakeHasher = new FakeHasher()
    fakeEncrypter = new FakeEncrypter()
    fakeEnv = new FakeEnv()
    fakeDateProvider = new DayJs()
    refreshTokenInMemoryRepository = new RefreshTokenInMemoryRepository()

    sut = new LoginOwnerService(
      ownersInMemoryRepository,
      fakeHasher,
      fakeEncrypter,
      fakeEnv as EnvService,
      fakeDateProvider,
      refreshTokenInMemoryRepository,
    )
  })

  it('should be able to create a new session to owner', async () => {
    const passwordHash = await fakeHasher.hash('12345678')

    const owner = makeOwner({
      login: 'jonas',
      password: passwordHash,
    })

    await ownersInMemoryRepository.create(owner)

    const response = await sut.execute({
      login: 'jonas',
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

  it('not should be able to create a new session to inexistent owner', async () => {
    const response = await sut.execute({
      login: 'jonas',
      password: '12345678',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(OwnerWrongCredentials)
  })

  it("not should be able to create a new session to owner if password doesn't match", async () => {
    const passwordHash = await fakeHasher.hash('12345678')

    const owner = makeOwner({
      login: 'jonas',
      password: passwordHash,
    })

    await ownersInMemoryRepository.create(owner)

    const response = await sut.execute({
      login: 'jonas',
      password: '123456789',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(OwnerWrongCredentials)
  })
})
