import { hash, compare } from 'bcryptjs'
import { HashComparer } from '../contracts/hashComparer'
import { HashGenerator } from '../contracts/hashGenerator'

export class BcryptHasher implements HashGenerator, HashComparer {
  async hash(plain: string): Promise<string> {
    const hashSalt = 10

    const hashCreated = await hash(plain, hashSalt)

    return hashCreated
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return await compare(plain, hash)
  }
}
