import { SellerInMemoryRepository } from '@test/repositories/modules/seller/SellerInMemoryRepository'
import { LoginSellerService } from './loginSeller.service'
import { FakeHasher } from '@test/repositories/providers/cryptography/fakeHasher'
import { makeSeller } from '@test/factories/modules/seller/makeSeller'
import { FakeEncrypter } from '@test/repositories/providers/cryptography/fakeEncrypter'
import { FakeEnv } from '@test/config/env/fakeEnv'
import { DayJs } from '@providers/date/implementations/dayJs'
import { EnvService } from '@infra/env/env.service'
import { SellerWrongCredentials } from '../errors/SellerWrongCredentials'
import { RefreshTokenInMemoryRepository } from '@test/repositories/modules/refreshToken/RefreshTokenInMemoryRepository'

let sellerInMemoryRepository: SellerInMemoryRepository
let fakeHasher: FakeHasher
let fakeEncrypter: FakeEncrypter
let fakeEnv: FakeEnv
let fakeDateProvider: DayJs
let refreshTokenInMemoryRepository: RefreshTokenInMemoryRepository

let sut: LoginSellerService

describe('Login Seller', () => {
  beforeEach(() => {
    sellerInMemoryRepository = new SellerInMemoryRepository()
    fakeHasher = new FakeHasher()
    fakeEncrypter = new FakeEncrypter()
    fakeEnv = new FakeEnv()
    fakeDateProvider = new DayJs()
    refreshTokenInMemoryRepository = new RefreshTokenInMemoryRepository()

    sut = new LoginSellerService(
      sellerInMemoryRepository,
      fakeHasher,
      fakeEncrypter,
      fakeEnv as EnvService,
      fakeDateProvider,
      refreshTokenInMemoryRepository,
    )
  })

  it('should be able to create a new session to seller', async () => {
    const passwordHash = await fakeHasher.hash('12345678')

    const seller = makeSeller({
      login: 'jonas',
      password: passwordHash,
    })

    await sellerInMemoryRepository.create(seller)

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

  it('not should be able to create a new session to inexistent seller', async () => {
    const response = await sut.execute({
      login: 'jonas',
      password: '12345678',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(SellerWrongCredentials)
  })

  it("not should be able to create a new session to seller if password doesn't match", async () => {
    const passwordHash = await fakeHasher.hash('12345678')

    const seller = makeSeller({
      login: 'jonas',
      password: passwordHash,
    })

    await sellerInMemoryRepository.create(seller)

    const response = await sut.execute({
      login: 'jonas',
      password: '123456789',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(SellerWrongCredentials)
  })
})
