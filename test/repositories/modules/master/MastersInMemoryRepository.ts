import { Master } from '@modules/master/entities/Master'
import { MastersRepository } from '@modules/master/repositories/MastersRepository'

export class MastersInMemoryRepository implements MastersRepository {
  masters: Master[] = []

  async findById(id: string): Promise<Master | null> {
    const master = this.masters.find((master) => master.id.toString() === id)

    if (!master) {
      return null
    }

    return master
  }
}
