import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { SellersPrismaMapper } from './SellersPrismaMapper'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { RoleCollaborator } from '@prisma/client'
import { Seller } from '@modules/seller/entities/Seller'

describe('Seller prisma mapper', () => {
  it('should be able to map a entity seller', () => {
    const seller = {
      id: 'id-1',
      password: 'senha456',
      email: 'usuario@teste.com',
      actualRemuneration: 50000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
      inactivatedAt: new Date(),
      role: RoleCollaborator.SELLER,
      marketId: 'market-1',
      companyId: 'company-1',
      userId: 'user-1',
    }

    const result = SellersPrismaMapper.toEntity(seller)
    const id = new UniqueEntityId('id-1')
    const marketId = new UniqueEntityId('market-1')
    const userId = new UniqueEntityId('user-1')

    expect(result.id).toStrictEqual(id)
    expect(result.password).toBe('senha456')
    expect(result.email).toBe('usuario@teste.com')
    expect(result.actualRemuneration).toBe(50000)
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
    expect(result.inactivatedAt).toBeInstanceOf(Date)
    expect(result.role).toBe(RoleCollaborator.SELLER)
    expect(result.marketId).toStrictEqual(marketId)
    expect(result.userId).toStrictEqual(userId)
  })

  it('should be able to map a prisma seller', () => {
    const seller = Seller.create(
      {
        password: 'senha456',
        email: 'usuario@teste.com',
        actualRemuneration: 50000,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        inactivatedAt: new Date(),
        role: CollaboratorRole.SELLER,
        marketId: new UniqueEntityId('market-1'),
        companyId: new UniqueEntityId('company-1'),
        userId: new UniqueEntityId('user-1'),
      },
      new UniqueEntityId('id-1'),
    )

    const result = SellersPrismaMapper.toPrisma(seller)
    const id = new UniqueEntityId('id-1')
    const marketId = new UniqueEntityId('market-1')
    const userId = new UniqueEntityId('user-1')

    expect(result.id).toStrictEqual(id.toString())
    expect(result.password).toBe('senha456')
    expect(result.email).toBe('usuario@teste.com')
    expect(result.actualRemuneration).toBe(50000)
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
    expect(result.inactivatedAt).toBeInstanceOf(Date)
    expect(result.role).toBe(RoleCollaborator.SELLER)
    expect(result.marketId).toStrictEqual(marketId.toString())
    expect(result.userId).toStrictEqual(userId.toString())
  })
})
