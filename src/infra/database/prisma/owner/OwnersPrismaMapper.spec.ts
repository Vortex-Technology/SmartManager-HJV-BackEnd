import { makeOwner } from '@test/factories/modules/owner/makeOwner'
import { OwnersPrismaMapper } from './OwnersPrismaMapper'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { RoleCollaborator } from '@prisma/client'

describe('Owner prisma mapper', async () => {
  it('should be able to map a entity', () => {
    const owner = {
      id: '1',
      password: 'password',
      email: 'email@example.com',
      actualRemuneration: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
      inactivatedAt: new Date(),
      marketId: null,
      companyId: 'companyId-1',
      userId: 'userId-1',
      role: RoleCollaborator.OWNER,
    }

    const result = OwnersPrismaMapper.toEntity(owner)

    const companyId = new UniqueEntityId('companyId-1')
    const userId = new UniqueEntityId('userId-1')
    const id = new UniqueEntityId('1')

    expect(result.id).toStrictEqual(id)
    expect(result.password).toBe('password')
    expect(result.email).toBe('email@example.com')
    expect(result.actualRemuneration).toBe(1000)
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
    expect(result.inactivatedAt).toBeInstanceOf(Date)
    expect(result.companyId).toStrictEqual(companyId)
    expect(result.userId).toStrictEqual(userId)
  })

  it('should be able to map a prisma owner', () => {
    const owner = makeOwner(
      {
        password: 'password',
        email: 'DaviLucca_Macedo@hotmail.com',
        actualRemuneration: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        inactivatedAt: new Date(),
        companyId: new UniqueEntityId('companyId-1'),
        marketId: new UniqueEntityId('marketId-1'),
        userId: new UniqueEntityId('userId-1'),
      },
      new UniqueEntityId('1'),
    )

    const result = OwnersPrismaMapper.toPrisma(owner)

    const companyId = new UniqueEntityId('companyId-1')
    const userId = new UniqueEntityId('userId-1')

    expect(result.id).toBe('1')
    expect(result.password).toBe('password')
    expect(result.email).toBe('DaviLucca_Macedo@hotmail.com')
    expect(result.actualRemuneration).toBe(1000)
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
    expect(result.inactivatedAt).toBeInstanceOf(Date)
    expect(result.companyId).toStrictEqual(companyId.toString())
    expect(result.userId).toStrictEqual(userId.toString())
  })

  it('not should be able to map to entity if company not exist in owner', () => {
    const owner = {
      id: '1',
      password: 'password',
      email: 'email@example.com',
      actualRemuneration: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
      inactivatedAt: new Date(),
      marketId: null,
      companyId: null,
      userId: 'userId-1',
      role: RoleCollaborator.OWNER,
    }

    expect(async () => {
      OwnersPrismaMapper.toEntity(owner)
    })
      .rejects.toBeInstanceOf(Error)
      .catch((err) => {
        throw err
      })
  })
})
