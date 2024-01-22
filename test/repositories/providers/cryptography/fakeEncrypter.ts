import { JwtSignOptions } from '@nestjs/jwt'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'
import { Decoder } from '@providers/cryptography/contracts/decoder'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'

export class FakeEncrypter implements Encrypter, Decoder {
  async encrypt(
    payload: Record<string, unknown>,
    options: JwtSignOptions = {},
  ): Promise<string> {
    return JSON.stringify({ payload, options })
  }

  async decrypt(
    token: string,
  ): Promise<{ payload?: TokenPayloadSchema; isValid: boolean }> {
    const decodedToken = JSON.parse(token)

    if (decodedToken.payload) {
      return {
        isValid: true,
        payload: decodedToken.payload,
      }
    }

    return {
      isValid: false,
    }
  }
}
