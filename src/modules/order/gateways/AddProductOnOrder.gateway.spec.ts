import { BadRequestException } from '@nestjs/common'
import { addProductOnOrderBodyValidationPipe } from './AddProductOnOrder.gateway'

describe('AddProductOnOrderGateway', async () => {
  it('should be able to validate body of add product on order', async () => {
    const body = {
      quantity: 1,
      barcode: '123456789012345678901234567890123456789012345678',
    }

    const result = addProductOnOrderBodyValidationPipe.transform(body)
    expect(result).toEqual(body)
  })

  it('not should be able to validate body of add product on order if quantity equal zero', async () => {
    expect(async () => {
      addProductOnOrderBodyValidationPipe.transform({
        quantity: 0,
        barcode: '123456789012345678901234567890123456789012345678',
      })
    })
      .rejects.toBeInstanceOf(BadRequestException)
      .catch((err) => {
        throw err
      })
  })

  it('not should be able to validate body of add product on order if barcode does not exist ', async () => {
    expect(async () => {
      addProductOnOrderBodyValidationPipe.transform({
        quantity: 1,
      })
    })
      .rejects.toBeInstanceOf(BadRequestException)
      .catch((err) => {
        throw err
      })
  })
})
