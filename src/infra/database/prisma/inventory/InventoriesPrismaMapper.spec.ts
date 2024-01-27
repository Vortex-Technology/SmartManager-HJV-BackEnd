import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { InventoriesPrismaMapper } from './InventoriesPrismaMapper'
import { Inventory } from '@modules/inventory/entities/Inventory'

describe('Inventory prisma mapper', () => {
  it('should be able to map a inventory', () => {
    const inventory = {
      id: 'id-1',
      name: 'name-inventory',
      companyId: 'company-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
      addressId: null,
    }

    const result = InventoriesPrismaMapper.toEntity(inventory)

    expect(result.name).toBe('name-inventory')
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
  })

  it('should be able to map to prisma', () => {
    const inventory = Inventory.create(
      {
        name: 'name-inventory',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        companyId: new UniqueEntityId('company-1'),
      },
      new UniqueEntityId('id-1'),
    )

    const result = InventoriesPrismaMapper.toPrisma(inventory)

    const id = new UniqueEntityId('id-1')

    expect(result.id).toBe(id.toString())
    expect(result.name).toBe('name-inventory')
    expect(result.companyId).toBe('company-1')
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(result.deletedAt).toBeInstanceOf(Date)
  })
})
