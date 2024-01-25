import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { UsersPrismaMapper } from './UsersPrismaMapper'
import { User } from '@modules/user/entities/User'

describe('Users prisma mapper', () => {
  it('should be able to map a entity users', () => {
    const user = {
      id: 'abc123',
      name: 'Usuário Teste',
      image: 'https://example.com/avatar.jpg',
      email: 'usuario@teste.com',
      emailVerifiedAt: new Date(),
      password: 'senha123',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
      addressId: 9876,
    }

    const result = UsersPrismaMapper.toEntity(user)
    const id = new UniqueEntityId('abc123')

    expect(result.id).toStrictEqual(id)
    expect(result.name).toBe('Usuário Teste')
    expect(result.image).toBe('https://example.com/avatar.jpg')
    expect(result.email).toBe('usuario@teste.com')
    expect(result.emailVerifiedAt).toBeInstanceOf(Date)
    expect(result.password).toBe('senha123')
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
  })

  it('should be able to map to prisma users', () => {
    const user = User.create(
      {
        name: 'Usuário Teste',
        image: 'https://example.com/avatar.jpg',
        email: 'usuario@teste.com',
        emailVerifiedAt: new Date(),
        password: 'senha123',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      },
      new UniqueEntityId('abc123'),
    )

    const result = UsersPrismaMapper.toPrisma(user)
    const id = new UniqueEntityId('abc123')

    expect(result.id).toStrictEqual(id.toString())
    expect(result.name).toBe('Usuário Teste')
    expect(result.image).toBe('https://example.com/avatar.jpg')
    expect(result.email).toBe('usuario@teste.com')
    expect(result.emailVerifiedAt).toBeInstanceOf(Date)
    expect(result.password).toBe('senha123')
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
  })
})
