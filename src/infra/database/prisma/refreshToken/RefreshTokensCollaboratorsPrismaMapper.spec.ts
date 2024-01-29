import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { RefreshTokensCollaboratorsPrismaMapper } from './RefreshTokensCollaboratorsPrismaMapper'
import { RefreshTokenCollaborator } from '@modules/refreshToken/entities/RefreshTokenCollaborator'

describe('Refresh token collaborator prisma mapper', () => {
  it('should be able to map to entity refresh token collaborator', () => {
    const result = RefreshTokensCollaboratorsPrismaMapper.toEntity({
      id: '1',
      apiKeyId: 'key-1',
      companyId: 'company-1',
      collaboratorId: 'collaborator-1',
      marketId: 'market-1',
      createdAt: new Date(),
      expiredAt: new Date(),
      expiresIn: new Date(),
      token: 'token',
    })

    const id = new UniqueEntityId('1')
    const apiKeyId = new UniqueEntityId('key-1')
    const companyId = new UniqueEntityId('company-1')
    const collaboratorId = new UniqueEntityId('collaborator-1')
    const marketId = new UniqueEntityId('market-1')

    expect(result.id).toStrictEqual(id)
    expect(result.apiKeyId).toStrictEqual(apiKeyId)
    expect(result.companyId).toStrictEqual(companyId)
    expect(result.collaboratorId).toStrictEqual(collaboratorId)
    expect(result.marketId).toStrictEqual(marketId)
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.expiredAt).toBeInstanceOf(Date)
    expect(result.expiresIn).toBeInstanceOf(Date)
    expect(result.token).toBe('token')
  })

  it('should be able to map to entity refresh token collaborator', () => {
    const body = RefreshTokenCollaborator.create(
      {
        apiKeyId: new UniqueEntityId('key-1'),
        companyId: new UniqueEntityId('company-1'),
        collaboratorId: new UniqueEntityId('collaborator-1'),
        marketId: new UniqueEntityId('market-1'),
        createdAt: new Date(),
        expiredAt: new Date(),
        expiresIn: new Date(),
        token: 'token',
      },
      new UniqueEntityId('1'),
    )

    const result = RefreshTokensCollaboratorsPrismaMapper.toPrisma(body)

    const id = new UniqueEntityId('1')
    const apiKeyId = new UniqueEntityId('key-1')
    const companyId = new UniqueEntityId('company-1')
    const collaboratorId = new UniqueEntityId('collaborator-1')
    const marketId = new UniqueEntityId('market-1')

    expect(result.id).toStrictEqual(id.toString())
    expect(result.apiKeyId).toStrictEqual(apiKeyId.toString())
    expect(result.companyId).toStrictEqual(companyId.toString())
    expect(result.collaboratorId).toStrictEqual(collaboratorId.toString())
    expect(result.marketId).toStrictEqual(marketId.toString())
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.expiredAt).toBeInstanceOf(Date)
    expect(result.expiresIn).toBeInstanceOf(Date)
    expect(result.token).toBe('token')
  })
})
