import { BadRequestException } from '@nestjs/common'
import { bodyValidationPipe } from './CreateUser.gateway'

describe('should to be able to creating a new user', () => {
  it('should be able to validate body a new user', () => {
    const result = bodyValidationPipe.transform({
      email: 'test@example.com',
      name: 'test',
      password: 'password',
      image: 'http://example.com',
    })

    expect(result).toEqual({
      email: 'test@example.com',
      name: 'test',
      password: 'password',
      image: 'http://example.com',
    })
  })

  it('not should be able to pass in validation body of create user with a invalid data', () => {
    expect(async () => {
      bodyValidationPipe.transform({
        email: 'wrong-email',
        name: 'wrong-name',
        password: 'wrong-password',
        image: 'wrong-http://example.com',
      })
    }).rejects.toBeInstanceOf(BadRequestException)
  })
})
