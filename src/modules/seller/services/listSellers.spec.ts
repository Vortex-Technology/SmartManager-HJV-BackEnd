import { SellerInMemoryRepository } from '@test/repositories/modules/seller/SellerInMemoryRepository'
import { makeSeller } from '@test/factories/modules/seller/makeSeller'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { Seller } from '../entities/Seller'
import { ListSellersService } from './listSellers.service'
import { AdministratorInMemoryRepository } from '@test/repositories/modules/administrator/AdministratorInMemoryRepository'
import { makeAdministrator } from '@test/factories/modules/administrator/makeAdministrator'
import { AdministratorNotFount } from '@modules/administrator/errors/AdministratorNotFound'

let sellerInMemoryRepository: SellerInMemoryRepository
let administratorInMemoryRepository: AdministratorInMemoryRepository

let sut: ListSellersService

describe('List Sellers', () => {
  beforeEach(() => {
    sellerInMemoryRepository = new SellerInMemoryRepository()
    administratorInMemoryRepository = new AdministratorInMemoryRepository()

    sut = new ListSellersService(
      sellerInMemoryRepository,
      administratorInMemoryRepository,
    )
  })

  it('should be able to list sellers', async () => {
    const administrator = makeAdministrator({}, new UniqueEntityId('1'))
    await administratorInMemoryRepository.create(administrator)

    for (let i = 0; i < 10; i++) {
      const seller = makeSeller()
      await sellerInMemoryRepository.create(seller)
    }

    const response = await sut.execute({
      administratorId: '1',
      limit: 30,
      page: 1,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.sellers[0]).toBeInstanceOf(Seller)
      expect(response.value.sellers).toHaveLength(10)
      expect(response.value.size).toBe(10)
      expect(response.value.page).toBe(1)
    }
  })

  it('should be able to list sellers with pagination', async () => {
    const administrator = makeAdministrator({}, new UniqueEntityId('1'))
    await administratorInMemoryRepository.create(administrator)

    for (let i = 0; i < 11; i++) {
      const seller = makeSeller()
      await sellerInMemoryRepository.create(seller)
    }

    const response = await sut.execute({
      administratorId: '1',
      page: 2,
      limit: 10,
    })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.sellers[0]).toBeInstanceOf(Seller)
      expect(response.value.sellers).toHaveLength(1)
      expect(response.value.size).toBe(11)
      expect(response.value.page).toBe(2)
    }
  })

  it('not should be able to create list sellers if seller not exists', async () => {
    const response = await sut.execute({
      administratorId: 'inexistent-id',
      page: 1,
      limit: 30,
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(AdministratorNotFount)
  })
})
