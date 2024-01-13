import { OwnersInMemoryRepository } from '@test/repositories/modules/owner/OwnersInMemoryRepository'
import { makeOwner } from '@test/factories/modules/owner/makeOwner'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { GetOwnerService } from './getOwner.service'
import { Owner } from '../entities/Owner'
import { OwnerNotFount } from '../errors/OwnerNotFound'

let ownersInMemoryRepository: OwnersInMemoryRepository

let sut: GetOwnerService

describe('Get Owner', () => {
  beforeEach(() => {
    ownersInMemoryRepository = new OwnersInMemoryRepository()

    sut = new GetOwnerService(ownersInMemoryRepository)
  })

  it('should be able to get owner', async () => {
    const owner = makeOwner({}, new UniqueEntityId('1'))
    await ownersInMemoryRepository.create(owner)

    const response = await sut.execute({ ownerId: '1' })

    expect(response.isRight()).toBe(true)

    if (response.isRight()) {
      expect(response.value.owner).toBeInstanceOf(Owner)
    }
  })

  it('not should be able to create get an inexistent owner', async () => {
    const response = await sut.execute({
      ownerId: 'inexistent-id',
    })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(OwnerNotFount)
  })
})
