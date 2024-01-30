import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { RefreshTokensPrismaMapper } from './RefreshTokensPrismaMapper'
import { RefreshToken } from '@modules/refreshToken/entities/RefreshToken'

describe('Refresh token prisma mapper', () => {
  it('should be able to map a entity refresh token', () => {
    const refreshToken = {
      id: 'id-1',
      token: 'token-1',
      expiresIn: new Date(),
      expiredAt: new Date(),
      createdAt: new Date(),
      userId: 'userId-1',
    }

    const result = RefreshTokensPrismaMapper.toEntity(refreshToken)
    const id = new UniqueEntityId('id-1')
    const userId = new UniqueEntityId('userId-1')

    expect(result.id).toStrictEqual(id)
    expect(result.token).toBe('token-1')
    expect(result.expiresIn).toBeInstanceOf(Date)
    expect(result.expiredAt).toBeInstanceOf(Date)
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.userId).toStrictEqual(userId)
  })

  it('should be able to map a prisma refresh token', () => {
    const refreshToken = RefreshToken.create(
      {
        token: 'token-1',
        expiresIn: new Date(),
        expiredAt: new Date(),
        createdAt: new Date(),
        userId: new UniqueEntityId('userId-1'),
      },
      new UniqueEntityId('id-1'),
    )

    const result = RefreshTokensPrismaMapper.toPrisma(refreshToken)
    const id = new UniqueEntityId('id-1')
    const userId = new UniqueEntityId('userId-1')

    expect(result.id).toStrictEqual(id.toString())
    expect(result.token).toBe('token-1')
    expect(result.expiresIn).toBeInstanceOf(Date)
    expect(result.expiredAt).toBeInstanceOf(Date)
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.userId).toStrictEqual(userId.toString())
  })
})
