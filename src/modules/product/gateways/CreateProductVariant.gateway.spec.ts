import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { ProductUnitType } from '../entities/Product'
import { createProductVariantBodyValidationPipe } from './CreateProductVariant.gateway'
import { BadRequestException } from '@nestjs/common'

describe('Create product variant gateway', async () => {
  it('should be able to create product variant', async () => {
    const body = {
      name: 'Produto Exemplo',
      description: 'Descrição do produto teste.',
      model: 'Modelo123',
      pricePerUnit: 19.99,
      brand: 'Marca Teste',
      image: 'https://example.com/product.jpg',
      barCode: '123456789012345678901234567890123456789012345678',
      quantity: 10,
      unitType: ProductUnitType.POL,
      inventoryId: new UniqueEntityId().toString(),
    }

    const result = createProductVariantBodyValidationPipe.transform(body)

    expect(result).toEqual(body)
    expect(result.name).toEqual('Produto Exemplo')
    expect(result.pricePerUnit).toEqual(19.99)
    expect(result.quantity).toEqual(10)
    expect(result.unitType).toBe(ProductUnitType.POL)
  })

  it('not should be able to validate body create product variant if belong a name', () => {
    expect(async () => {
      createProductVariantBodyValidationPipe.transform({
        description: 'Descrição do produto teste.',
        model: 'Modelo123',
        pricePerUnit: 19.99,
        brand: 'Marca Teste',
        image: 'https://example.com/product.jpg',
        barCode: '123456789012345678901234567890123456789012345678',
        quantity: 10,
        unitType: ProductUnitType.POL,
        inventoryId: new UniqueEntityId().toString(),
      })
    }).rejects.toBeInstanceOf(BadRequestException)
  })

  it('not should be able to validate body create product variant if price per unit to equal zero', () => {
    expect(async () => {
      createProductVariantBodyValidationPipe.transform({
        name: 'Produto Exemplo',
        description: 'Descrição do produto teste.',
        model: 'Modelo123',
        pricePerUnit: 0,
        brand: 'Marca Teste',
        image: 'https://example.com/product.jpg',
        barCode: '123456789012345678901234567890123456789012345678',
        quantity: 10,
        unitType: ProductUnitType.POL,
        inventoryId: new UniqueEntityId().toString(),
      })
    }).rejects.toBeInstanceOf(BadRequestException)
  })

  it('not should be able to validate body create product variant if belong a barcode', () => {
    expect(async () => {
      createProductVariantBodyValidationPipe.transform({
        name: 'Produto Exemplo',
        description: 'Descrição do produto teste.',
        model: 'Modelo123',
        pricePerUnit: 19.99,
        brand: 'Marca Teste',
        image: 'https://example.com/product.jpg',
        quantity: 10,
        unitType: ProductUnitType.POL,
        inventoryId: new UniqueEntityId().toString(),
      })
    }).rejects.toBeInstanceOf(BadRequestException)
  })
})
