import { BadRequestException } from '@nestjs/common'
import { bodyValidationPipe } from './CreateCompany.gateway'

describe('Create company gateway', () => {
  // it('should be able to validate body of creation company', async () => {
  //   const body = {
  //     email: 'Joasd@example.com',
  //   }

  //   const result = bodyValidationPipe.transform(body)

  //   expect(result).toEqual(body)
  // })

  it('not should be able to pass in validation body of creation company with a invalid email', async () => {
    expect(async () => {
      bodyValidationPipe.transform({
        email: 'wrong-email',
      })
    })
      .rejects.toBeInstanceOf(BadRequestException)
      .catch((err) => {
        throw err
      })
  })
})
