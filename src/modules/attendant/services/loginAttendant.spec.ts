import { AttendantInMemoryRepository } from '@test/repositories/modules/attendant/AttendantInMemoryRepository'
import { LoginAttendantService } from './loginAttendant.service'
import { FakeHasher } from '@test/repositories/providers/cryptography/fakeHasher'
import { makeAttendant } from '@test/factories/modules/attendant/makeAttendant'
import { FakeEncrypter } from '@test/repositories/providers/cryptography/fakeEncrypter'
import { FakeEnv } from '@test/config/env/fakeEnv'
import { DayJs } from '@providers/date/implementations/dayJs'
import { EnvService } from '@infra/env/env.service'
import { AttendantWrongCredentials } from '../errors/AttendantWrongCredentials'
import { RefreshTokenInMemoryRepository } from '@test/repositories/modules/refreshToken/RefreshTokenInMemoryRepository'

let attendantInMemoryRepository: AttendantInMemoryRepository
let fakeHasher: FakeHasher
let fakeEncrypter: FakeEncrypter
let fakeEnv: FakeEnv
let fakeDateProvider: DayJs
let refreshTokenInMemoryRepository: RefreshTokenInMemoryRepository

let sut: LoginAttendantService

describe('Login Attendant', () => {
  beforeEach(() => {
    attendantInMemoryRepository = new AttendantInMemoryRepository()
    fakeHasher = new FakeHasher()
    fakeEncrypter = new FakeEncrypter()
    fakeEnv = new FakeEnv()
    fakeDateProvider = new DayJs()
    refreshTokenInMemoryRepository = new RefreshTokenInMemoryRepository()

    sut = new LoginAttendantService(
      attendantInMemoryRepository,
      fakeHasher,
      fakeEncrypter,
      fakeEnv as EnvService,
      fakeDateProvider,
      refreshTokenInMemoryRepository,
    )
  })

  it('should be able to create a new session to attendant', async () => {
    const passwordHash = await fakeHasher.hash('12345678')

    const attendant = makeAttendant({
      login: 'jonas',
      password: passwordHash,
    })

    await attendantInMemoryRepository.create(attendant)

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

  it('not should be able to create a new session to inexistent attendant', async () => {
    const response = await sut.execute({
      login: 'jonas',
      password: '12345678',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(AttendantWrongCredentials)
  })

  it("not should be able to create a new session to attendant if password doesn't match", async () => {
    const passwordHash = await fakeHasher.hash('12345678')

    const attendant = makeAttendant({
      login: 'jonas',
      password: passwordHash,
    })

    await attendantInMemoryRepository.create(attendant)

    const response = await sut.execute({
      login: 'jonas',
      password: '123456789',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(AttendantWrongCredentials)
  })
})
