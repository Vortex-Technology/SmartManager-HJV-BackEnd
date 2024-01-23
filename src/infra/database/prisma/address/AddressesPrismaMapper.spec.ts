import { Address } from '@shared/core/valueObjects/Address'
import { AddressesPrismaMapper } from './AddressesPrismaMapper'

describe('Address Prisma Mapper', () => {
  it('should be able to map to entity', () => {
    const address = {
      id: 1,
      city: 'San Francisco',
      country: 'CA',
      complement: 'complement',
      neighborhood: 'vile',
      number: '1',
      postalCode: '123',
      state: 'San Francisco',
      street: 'San vile',
    }

    const result = AddressesPrismaMapper.toEntity(address)

    expect(result.city).toBe('San Francisco')
    expect(result.country).toBe('CA')
    expect(result.complement).toBe('complement')
    expect(result.neighborhood).toBe('vile')
    expect(result.number).toBe('1')
    expect(result.postalCode).toBe('123')
    expect(result.state).toBe('San Francisco')
    expect(result.street).toBe('San vile')
  })

  it('should be able to map to prisma', () => {
    const address = Address.create({
      city: 'San Francisco',
      country: 'CA',
      complement: 'complement',
      neighborhood: 'vile',
      number: '1',
      postalCode: '123',
      state: 'San Francisco',
      street: 'San ville',
    })

    const result = AddressesPrismaMapper.toPrisma(address)

    expect(result.city).toBe('San Francisco')
    expect(result.country).toBe('CA')
    expect(result.complement).toBe('complement')
    expect(result.neighborhood).toBe('vile')
    expect(result.number).toBe('1')
    expect(result.postalCode).toBe('123')
    expect(result.state).toBe('San Francisco')
    expect(result.street).toBe('San ville')
  })
})
