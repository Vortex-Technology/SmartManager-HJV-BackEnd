import { BadRequestException } from '@nestjs/common'
import { createProductBodyValidationPipe } from './createProduct.gateway'

describe('should create product', () => {
  it('should be able  to validate body a new product', () => {
    const body = {
      name: 'test-product',
      variants: [
        {
          name: 'test-variant',
          pricePerUnit: 1000,
          brand: 'test-brand',
          barCode: '123456789012345678901234567890123456789012345678',
          quantity: 50,
          unitType: 'UN',
        },
      ],
    }

    const result = createProductBodyValidationPipe.transform(body)

    expect(result).toEqual(body)
  })

  it('not should be able to validate body a new product', () => {
    expect(async () => {
      createProductBodyValidationPipe.transform({
        name: 'wrong-product',
        variants: [
          {
            name: 'wrong-variant',
            pricePerUnit: 0,
            brand: 'wrong-brand',
            barCode: '123456789012345678901234567890123456789012345678',
            quantity: 0,
            unitType: 'wrong',
          },
        ],
      })
    }).rejects.toBeInstanceOf(BadRequestException)
  })
})
