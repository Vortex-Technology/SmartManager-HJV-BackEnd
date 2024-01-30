import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { CollaboratorPresenter } from './CollaboratorPresenter'
import { makeManager } from '@test/factories/modules/manager/makeManager'
import { makeOwner } from '@test/factories/modules/owner/makeOwner'

describe('Collaborator presenter', async () => {
  it('should be able to map owner  ', async () => {
    const collaborator = makeOwner(
      {
        companyId: new UniqueEntityId('company-1'),

        email: 'test@gmail.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        actualRemuneration: 100,
        password: 'password',
      },
      new UniqueEntityId('1'),
    )

    const result = CollaboratorPresenter.toHTTP(collaborator)

    const id = new UniqueEntityId('1')
    const companyId = new UniqueEntityId('company-1')

    expect(result.id).toStrictEqual(id.toString())
    expect(result.companyId).toStrictEqual(companyId.toString())
    expect(result.email).toBe('test@gmail.com')
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
    expect(result.actualRemuneration).toBe(100)
  })

  it('should be able to map manager  ', async () => {
    const collaborator = makeManager(
      {
        marketId: new UniqueEntityId('market-1'),
        email: 'test@gmail.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        actualRemuneration: 100,
        password: 'password',
      },
      new UniqueEntityId('1'),
    )

    const result = CollaboratorPresenter.toHTTP(collaborator)

    const id = new UniqueEntityId('1')
    const marketId = new UniqueEntityId('market-1')

    expect(result.id).toStrictEqual(id.toString())
    expect(result.marketId).toStrictEqual(marketId.toString())
    expect(result.email).toBe('test@gmail.com')
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
    expect(result.actualRemuneration).toBe(100)
  })
})
