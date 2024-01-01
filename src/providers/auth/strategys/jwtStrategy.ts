import { EnvService } from '@infra/env/env.service'
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { z } from 'zod'

const tokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  role: z
    .enum(['MASTER', 'FULL_ACCESS', 'EDITOR', 'VIEWER'])
    .nullable()
    .optional(),
  type: z.enum(['ADMINISTRATOR', 'ATTENDANT', 'SELLER']),
})

export type TokenPayloadSchema = z.infer<typeof tokenPayloadSchema>

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly env: EnvService) {
    const publicKey = env.get('JWT_PUBLIC_KEY')

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
    })
  }

  async validate(payload: TokenPayloadSchema) {
    return tokenPayloadSchema.parse(payload)
  }
}
