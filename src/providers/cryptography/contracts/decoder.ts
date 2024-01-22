import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy'

export abstract class Decoder {
  abstract decrypt(
    token: string,
  ): Promise<{ payload?: TokenPayloadSchema; isValid: boolean }>
}
