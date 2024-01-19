import { BadRequestException } from '@nestjs/common'
import { bodyValidationPipe } from './CreateCompany.gateway'

describe('Create company gateway', () => {
  it('should be able to validate body of creation company', async () => {
    const result = bodyValidationPipe.transform({
      email: 'Joasd@example.com',
    })

    expect(result).toEqual({ email: 'Joasd@example.com' })
  })

  it('not should be able to pass in validation body of creation company with a invalid email', async () => {
    expect(() => {
      bodyValidationPipe.transform({
        email: 'wrong-email',
      })
    }).rejects.toBeInstanceOf(BadRequestException)
  })
})
