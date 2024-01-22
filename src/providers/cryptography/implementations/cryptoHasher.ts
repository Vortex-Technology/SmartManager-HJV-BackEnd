import { randomBytes } from 'crypto'
import { HandleHashGenerator } from '../contracts/handleHashGenerator'

export class CryptoHasher implements HandleHashGenerator {
  async handleHash(): Promise<string> {
    const hash = randomBytes(64).toString('hex')
    return hash
  }
}
