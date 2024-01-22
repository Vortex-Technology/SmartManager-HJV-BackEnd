import {
  Collaborator,
  CollaboratorRole,
} from '@modules/collaborator/entities/Collaborator'
import { CollaboratorsPrismaMapper } from './CollaboratorsPrismaMapper'
import {
  Collaborator as CollaboratorPrisma,
  RoleCollaborator,
} from '@prisma/client'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import dayjs from 'dayjs'

describe('Collaborators prisma mapper', () => {
  it('should be able to map collaborator to entity', () => {
    const collaborator: CollaboratorPrisma = {
      actualRemuneration: 1000,
      companyId: 'company-1',
      createdAt: new Date(),
      deletedAt: null,
      email: 'jonas@jonas.com',
      id: 'collaborator-1',
      inactivatedAt: null,
      marketId: 'market-1',
      password: '123456',
      role: 'MANAGER',
      updatedAt: new Date(),
      userId: 'user-1',
    }

    const collaboratorId = new UniqueEntityId('collaborator-1')
    const marketId = new UniqueEntityId('market-1')
    const userId = new UniqueEntityId('user-1')
    const companyId = new UniqueEntityId('company-1')

    const result = CollaboratorsPrismaMapper.toEntity(collaborator)

    expect(result).toBeInstanceOf(Collaborator)
    expect(result.id.equals(collaboratorId)).toBe(true)
    expect(result.email).toBe('jonas@jonas.com')
    expect(result.password).toBe('123456')
    expect(result.marketId?.equals(marketId)).toBe(true)
    expect(result.userId.equals(userId)).toBe(true)
    expect(result.actualRemuneration).toBe(1000)
    expect(result.companyId?.equals(companyId)).toBe(true)
    expect(result.role).toEqual(CollaboratorRole.MANAGER)
  })

  it('should be able to map collaborator to prisma', () => {
    const collaborator = Collaborator.createUntyped(
      {
        email: 'jonas@jonas.com',
        password: '123456',
        actualRemuneration: 1000,
        companyId: new UniqueEntityId('company-1'),
        marketId: new UniqueEntityId('market-1'),
        userId: new UniqueEntityId('user-1'),
        role: CollaboratorRole.MANAGER,
      },
      new UniqueEntityId('collaborator-1'),
    )

    const result = CollaboratorsPrismaMapper.toPrisma(collaborator)

    // validando que a data é a mesma do momento em que o colaborador foi criado, ignorando os milliseconds
    const createdAtIsActualDate = dayjs(new Date()).isSame(
      collaborator.createdAt,
      'seconds',
    )

    expect(result.id).toEqual('collaborator-1')
    expect(result.userId).toEqual('user-1')
    expect(result.marketId).toEqual('market-1')
    expect(result.companyId).toEqual('company-1')
    expect(result.role).toEqual(RoleCollaborator.MANAGER)
    expect(result.email).toEqual('jonas@jonas.com')
    expect(result.password).toEqual('123456')
    expect(result.actualRemuneration).toEqual(1000)
    expect(result.deletedAt).toEqual(null)
    expect(result.updatedAt).toEqual(null)
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(createdAtIsActualDate).toEqual(true)
  })

  it('should be able to map collaborator to entity without marketId', () => {
    const collaborator: CollaboratorPrisma = {
      actualRemuneration: 1000,
      companyId: 'company-1',
      createdAt: new Date(),
      deletedAt: null,
      email: 'jonas@jonas.com',
      id: 'collaborator-1',
      inactivatedAt: null,
      marketId: null,
      password: '123456',
      role: 'MANAGER',
      updatedAt: new Date(),
      userId: 'user-1',
    }

    const companyId = new UniqueEntityId('company-1')

    const result = CollaboratorsPrismaMapper.toEntity(collaborator)

    expect(result.companyId?.equals(companyId)).toBe(true)
    expect(result.marketId).toEqual(null)
  })

  it('should be able to map collaborator to entity without companyId', () => {
    const collaborator: CollaboratorPrisma = {
      actualRemuneration: 1000,
      companyId: null,
      createdAt: new Date(),
      deletedAt: null,
      email: 'jonas@jonas.com',
      id: 'collaborator-1',
      inactivatedAt: null,
      marketId: 'market-1',
      password: '123456',
      role: 'MANAGER',
      updatedAt: new Date(),
      userId: 'user-1',
    }

    const marketId = new UniqueEntityId('market-1')

    const result = CollaboratorsPrismaMapper.toEntity(collaborator)

    expect(result.marketId?.equals(marketId)).toBe(true)
    expect(result.companyId).toEqual(null)
  })
})
