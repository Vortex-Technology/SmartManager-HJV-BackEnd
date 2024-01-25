import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { ApiKeysPrismaMapper } from './ApiKeysPrismaMapper'
import { ApiKey } from '@modules/company/entities/ApiKey'

describe('Api keys prisma mapper', async () => {
  it('should be able to map a entity ', async () => {
    const apiKey = {
      id: 'id-1',
      key: 'key-1',
      secret: 'secret-1',
      revokedAt: new Date(),
      companyId: 'companyId-1',
    }

    const result = ApiKeysPrismaMapper.toEntity(apiKey)
    const companyId = new UniqueEntityId('companyId-1')
    const id = new UniqueEntityId('id-1')

    expect(result.revokedAt).toBeInstanceOf(Date)
    expect(result.companyId).toStrictEqual(companyId)
    expect(result.secret).toBe('secret-1')
    expect(result.key).toBe('key-1')
    expect(result.id).toStrictEqual(id)
  })

  it('should be able to  map a prisma api key', () => {
    const apiKey = ApiKey.create({
      key: 'key-1',
      secret: 'secret-1',
      revokedAt: new Date(),
      companyId: new UniqueEntityId('companyId-1'),
    })

    const result = ApiKeysPrismaMapper.toPrisma(apiKey)

    expect(result.revokedAt).toBeInstanceOf(Date)
    expect(result.companyId).toBe('companyId-1')
    expect(result.secret).toBe('secret-1')
    expect(result.key).toBe('key-1')
  })
})
