import { JwtSignOptions } from '@nestjs/jwt'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'

export class FakeEncrypter implements Encrypter {
  async encrypt(
    payload: Record<string, unknown>,
    options: JwtSignOptions = {},
  ): Promise<string> {
    return JSON.stringify({ payload, options })
  }
}
