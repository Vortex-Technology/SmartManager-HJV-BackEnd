import { Master } from '../entities/Master'

export abstract class MastersRepository {
  abstract findById(id: string): Promise<Master | null>
}
