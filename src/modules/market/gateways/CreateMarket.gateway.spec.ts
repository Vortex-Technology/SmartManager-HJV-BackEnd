import { BadRequestException } from '@nestjs/common'
import { createMarketBodyValidationPipe } from './CreateMarket.gateway'

describe('Create market gateway', async () => {
  it('should be able to validate body of creation market', async () => {
    const body = {
      tradeName: 'Nome Comercial',
      street: 'Rua Exemplo',
      number: '123',
      neighborhood: 'Bairro Teste',
      city: 'Cidade Teste',
      state: 'ST',
      postalCode: '12345678',
      country: 'BR',
      complement: 'Complemento Teste',
    }

    const result = createMarketBodyValidationPipe.transform(body)

    expect(result).toEqual(body)
  })
  it('not should be able to pass in validation body of creation company with a invalid email', async () => {
    expect(async () => {
      createMarketBodyValidationPipe.transform({
        postalCode: 'wrong-postalCode',
      })
    })
      .rejects.toBeInstanceOf(BadRequestException)
      .catch((err) => {
        throw err
      })
  })
})
