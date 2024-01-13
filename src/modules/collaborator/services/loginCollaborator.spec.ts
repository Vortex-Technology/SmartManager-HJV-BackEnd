import { LoginCollaboratorService } from './loginCollaborator.service'
import { FakeHasher } from '@test/repositories/providers/cryptography/fakeHasher'
import { FakeEncrypter } from '@test/repositories/providers/cryptography/fakeEncrypter'
import { FakeEnv } from '@test/config/env/fakeEnv'
import { DayJs } from '@providers/date/implementations/dayJs'
import { EnvService } from '@infra/env/env.service'
import { CollaboratorWrongCredentials } from '../errors/CollaboratorWrongCredentials'
import { RefreshTokenInMemoryRepository } from '@test/repositories/modules/refreshToken/RefreshTokenInMemoryRepository'
import { CollaboratorsInMemoryRepository } from '@test/repositories/modules/collaborator/CollaboratorsInMemoryRepository'
import { makeOwner } from '@test/factories/modules/owner/makeOwner'

let collaboratorsInMemoryRepository: CollaboratorsInMemoryRepository
let fakeHasher: FakeHasher
let fakeEncrypter: FakeEncrypter
let fakeEnv: FakeEnv
let fakeDateProvider: DayJs
let refreshTokenInMemoryRepository: RefreshTokenInMemoryRepository

let sut: LoginCollaboratorService

describe('Login Collaborator', () => {
  beforeEach(() => {
    collaboratorsInMemoryRepository = new CollaboratorsInMemoryRepository()
    fakeHasher = new FakeHasher()
    fakeEncrypter = new FakeEncrypter()
    fakeEnv = new FakeEnv()
    fakeDateProvider = new DayJs()
    refreshTokenInMemoryRepository = new RefreshTokenInMemoryRepository()

    sut = new LoginCollaboratorService(
      collaboratorsInMemoryRepository,
      fakeHasher,
      fakeEncrypter,
      fakeEnv as EnvService,
      fakeDateProvider,
      refreshTokenInMemoryRepository,
    )
  })

  it('should be able to create a new session to collaborator', async () => {
    const passwordHash = await fakeHasher.hash('12345678')

    const collaborator = makeOwner({
      login: 'jonas',
      password: passwordHash,
    })

    collaboratorsInMemoryRepository.collaborators.push(collaborator)

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

  it('not should be able to create a new session to inexistent collaborator', async () => {
    const response = await sut.execute({
      login: 'jonas',
      password: '12345678',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CollaboratorWrongCredentials)
  })

  it("not should be able to create a new session to collaborator if password doesn't match", async () => {
    const passwordHash = await fakeHasher.hash('12345678')

    const collaborator = makeOwner({
      login: 'jonas',
      password: passwordHash,
    })

    collaboratorsInMemoryRepository.collaborators.push(collaborator)

    const response = await sut.execute({
      login: 'jonas',
      password: '123456789',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(CollaboratorWrongCredentials)
  })
})
