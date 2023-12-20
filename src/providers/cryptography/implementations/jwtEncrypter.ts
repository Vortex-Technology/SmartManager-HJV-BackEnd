import { Injectable } from '@nestjs/common'
import { Encrypter } from '../contracts/encrypter'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'

@Injectable()
export class JwtEncrypter implements Encrypter {
  constructor(private readonly jwtService: JwtService) {}

  async encrypt(
    payload: Record<string, unknown>,
    options: JwtSignOptions = {},
  ): Promise<string> {
    return await this.jwtService.signAsync(payload, options)
  }
}
