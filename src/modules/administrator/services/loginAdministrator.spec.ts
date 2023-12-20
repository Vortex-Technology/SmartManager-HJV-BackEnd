import { AdministratorInMemoryRepository } from '@test/repositories/modules/administrator/AdministratorInMemoryRepository'
import { LoginAdministratorService } from './loginAdministrator.service'
import { FakeHasher } from '@test/repositories/providers/cryptography/fakeHasher'
import { makeAdministrator } from '@test/factories/modules/administrator/makeAdministrator'
import { FakeEncrypter } from '@test/repositories/providers/cryptography/fakeEncrypter'
import { FakeEnv } from '@test/config/env/fakeEnv'
import { DayJs } from '@providers/date/implementations/dayJs'
import { RefreshAdministratorTokenInMemoryRepository } from '@test/repositories/modules/administrator/RefreshAdministratorTokenInMemoryRepository'
import { EnvService } from '@infra/env/env.service'
import { AdministratorWrongCredentials } from '../errors/AdministratorWrongCredentials'

let administratorInMemoryRepository: AdministratorInMemoryRepository
let fakeHasher: FakeHasher
let fakeEncrypter: FakeEncrypter
let fakeEnv: FakeEnv
let fakeDateProvider: DayJs
let refreshAdministratorTokenInMemoryRepository: RefreshAdministratorTokenInMemoryRepository

let sut: LoginAdministratorService

describe('Login Administrator', () => {
  beforeEach(() => {
    administratorInMemoryRepository = new AdministratorInMemoryRepository()
    fakeHasher = new FakeHasher()
    fakeEncrypter = new FakeEncrypter()
    fakeEnv = new FakeEnv()
    fakeDateProvider = new DayJs()
    refreshAdministratorTokenInMemoryRepository =
      new RefreshAdministratorTokenInMemoryRepository()

    sut = new LoginAdministratorService(
      administratorInMemoryRepository,
      fakeHasher,
      fakeEncrypter,
      fakeEnv as EnvService,
      fakeDateProvider,
      refreshAdministratorTokenInMemoryRepository,
    )
  })

  it('should be able to create a new session to administrator', async () => {
    const passwordHash = await fakeHasher.hash('12345678')

    const administrator = makeAdministrator({
      login: 'jonas',
      password: passwordHash,
    })

    await administratorInMemoryRepository.create(administrator)

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

  it('not should be able to create a new session to inexistent administrator', async () => {
    const response = await sut.execute({
      login: 'jonas',
      password: '12345678',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(AdministratorWrongCredentials)
  })

  it("not should be able to create a new session to administrator if password doesn't match", async () => {
    const passwordHash = await fakeHasher.hash('12345678')

    const administrator = makeAdministrator({
      login: 'jonas',
      password: passwordHash,
    })

    await administratorInMemoryRepository.create(administrator)

    const response = await sut.execute({
      login: 'jonas',
      password: '123456789',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(AdministratorWrongCredentials)
  })
})
