import { Injectable } from '@nestjs/common'
import { Encrypter } from '../contracts/encrypter'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { Decoder } from '../contracts/decoder'
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'

@Injectable()
export class JwtEncrypter implements Encrypter, Decoder {
  constructor(private readonly jwtService: JwtService) {}

  async encrypt(
    payload: Record<string, unknown>,
    options: JwtSignOptions = {},
  ): Promise<string> {
    return await this.jwtService.signAsync(payload, options)
  }

  async decrypt(
    token: string,
  ): Promise<{ payload?: TokenPayloadSchema; isValid: boolean }> {
    try {
      const payload = await this.jwtService.verifyAsync(token)

      return { payload, isValid: true }
    } catch (error) {
      return { isValid: false }
    }
  }
}
