import { hash, compare } from 'bcryptjs'
import { HashComparer } from '../contracts/hashComparer'
import { HashGenerator } from '../contracts/hashGenerator'

export class BcryptHasher implements HashGenerator, HashComparer {
  async hash(plain: string): Promise<string> {
    const hashSalt = 10

    const plainHashed = await hash(plain, hashSalt)
    const encryptedPlainFinal = `${plainHashed}${hashSalt}`

    return encryptedPlainFinal
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash)
  }
}
