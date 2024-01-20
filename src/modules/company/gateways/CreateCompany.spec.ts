import { BadRequestException } from '@nestjs/common'
import { createCompanyBodyValidationPipe } from './CreateCompany.gateway'

describe('Create company gateway', () => {
  it('should be able to validate body of creation company', async () => {
    const body = {
      startedIssueInvoicesNow: true,
      companyName: 'Minha Empresa',
      email: 'contato@minhaempresa.com',
      sector: 'Tecnologia',
      street: 'Rua Principal',
      number: '123',
      neighborhood: 'Bairro Central',
      city: 'Cidade Grande',
      state: 'SP',
      postalCode: '12345678',
      markets: [
        {
          tradeName: 'Mercado 1',
          street: 'Rua Comercial',
          number: '456',
          neighborhood: 'Bairro Comercial',
          city: 'Cidade Comercial',
          state: 'RJ',
          postalCode: '87654321',
        },
      ],
    }

    const result = createCompanyBodyValidationPipe.transform(body)

    expect(result).toEqual(body)
  })

  it('not should be able to pass in validation body of creation company with a invalid email', async () => {
    expect(async () => {
      createCompanyBodyValidationPipe.transform({
        email: 'wrong-email',
      })
    })
      .rejects.toBeInstanceOf(BadRequestException)
      .catch((err) => {
        throw err
      })
  })
})
