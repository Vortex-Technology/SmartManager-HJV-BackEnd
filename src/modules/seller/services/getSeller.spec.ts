import { SellerInMemoryRepository } from '@test/repositories/modules/seller/SellerInMemoryRepository'
import { makeSeller } from '@test/factories/modules/seller/makeSeller'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { GetSellerService } from './getSeller.service'
import { Seller } from '../entities/Seller'
import { SellerNotFount } from '../errors/SellerNotFound'

let sellerInMemoryRepository: SellerInMemoryRepository

let sut: GetSellerService

describe('Get Seller', () => {
  beforeEach(() => {
    sellerInMemoryRepository = new SellerInMemoryRepository()

    sut = new GetSellerService(sellerInMemoryRepository)
  })

  it('should be able to get seller', async () => {
    const seller = makeSeller({}, new UniqueEntityId('1'))
    await sellerInMemoryRepository.create(seller)

    const response = await sut.execute({ sellerId: '1' })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.seller).toBeInstanceOf(Seller)
    }
  })

  it('not should be able to create get an inexistent seller', async () => {
    const response = await sut.execute({
      sellerId: 'inexistent-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(SellerNotFount)
  })
})
