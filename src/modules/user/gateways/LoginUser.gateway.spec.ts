import { BadRequestException } from '@nestjs/common'
import { loginUserBodyValidationPipe } from './LoginUser.gateway'

describe('Login user gateway', () => {
  it('should be able to validate body of login user', () => {
    const body = {
      email: 'test@example.com',
      password: 'test-password',
    }
    const result = loginUserBodyValidationPipe.transform(body)

    expect(result).toEqual(body)
  })

  it('not should be able to pass in validation body of login user with a invalid data', () => {
    expect(async () => {
      loginUserBodyValidationPipe.transform({
        email: 'wrong-test',
        password: 'wrong',
      })
    })
      .rejects.toBeInstanceOf(BadRequestException)
      .catch((err) => {
        console.log(err)
        throw err
      })
  })
})
