import { CreateSellerService } from './createSeller.service'
import { FakeHasher } from '@test/repositories/providers/cryptography/fakeHasher'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { PermissionDenied } from '@shared/errors/PermissionDenied'
import { AdministratorInMemoryRepository } from '@test/repositories/modules/administrator/AdministratorInMemoryRepository'
import { SellerInMemoryRepository } from '@test/repositories/modules/seller/SellerInMemoryRepository'
import { SellerAlreadyExistsWithSame } from '@modules/seller/errors/SellerAlreadyExistsWithSame'
import { AdministratorRole } from '../entities/Administrator'
import { makeAdministrator } from '@test/factories/modules/administrator/makeAdministrator'
import { makeSeller } from '@test/factories/modules/seller/makeSeller'
import { AdministratorNotFount } from '../errors/AdministratorNotFound'

let administratorInMemoryRepository: AdministratorInMemoryRepository
let sellerInMemoryRepository: SellerInMemoryRepository
let fakeHasher: FakeHasher

let sut: CreateSellerService

describe('Create Seller', () => {
  beforeEach(() => {
    administratorInMemoryRepository = new AdministratorInMemoryRepository()
    sellerInMemoryRepository = new SellerInMemoryRepository()
    fakeHasher = new FakeHasher()

    sut = new CreateSellerService(
      administratorInMemoryRepository,
      sellerInMemoryRepository,
      fakeHasher,
    )
  })

  it('should be able to create a new seller', async () => {
    const creator = makeAdministrator(
      {
        role: AdministratorRole.MASTER,
      },
      new UniqueEntityId('1'),
    )

    await administratorInMemoryRepository.create(creator)

    const response = await sut.execute({
      login: 'Jonas!! Álvaro',
      name: 'Jonas',
      password: 'jonas1234',
      creatorId: '1',
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.seller.name).toEqual('Jonas')
      expect(response.value.seller.login).toEqual('jonas-alvaro')
      expect(response.value.seller.password).not.toEqual('jonas1234')
    }
  })

  it('not should be able create a new seller with the same login', async () => {
    const creator = makeAdministrator(
      {
        role: AdministratorRole.MASTER,
      },
      new UniqueEntityId('1'),
    )

    const sellerMock1 = makeSeller({
      login: 'jonas12',
    })

    await administratorInMemoryRepository.create(creator)
    await sellerInMemoryRepository.create(sellerMock1)

    const response = await sut.execute({
      login: 'jonas12',
      name: 'jonas',
      password: 'jonas1234',
      creatorId: '1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(SellerAlreadyExistsWithSame)
    expect(sellerInMemoryRepository.sellers).toHaveLength(1)
  })

  it('not should be able create a new seller if creator not a MASTER, FULL_ACCESS or EDITOR adm', async () => {
    const creator = makeAdministrator(
      {
        role: AdministratorRole.VIEWER,
      },
      new UniqueEntityId('1'),
    )

    await administratorInMemoryRepository.create(creator)

    const response = await sut.execute({
      login: 'jonas12',
      name: 'jonas',
      password: 'jonas1234',
      creatorId: '1',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(PermissionDenied)
    expect(sellerInMemoryRepository.sellers).toHaveLength(0)
  })

  it('not should be able create a new seller if creator not exists', async () => {
    const response = await sut.execute({
      login: 'jonas12',
      name: 'jonas',
      password: 'jonas1234',
      creatorId: 'inexistent-creator-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(AdministratorNotFount)
    expect(sellerInMemoryRepository.sellers).toHaveLength(0)
  })
})
