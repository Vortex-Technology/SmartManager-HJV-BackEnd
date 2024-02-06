import { z } from 'zod'

export type CloseOrderBody = z.infer<typeof closeOrderBodySchema> & {}

export class CloseOrderGateway {
  constructor() { }
}
