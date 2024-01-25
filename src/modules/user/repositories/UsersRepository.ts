import { User } from '../entities/User'

export abstract class UsersRepository<ConfigT = unknown> {
  abstract findByEmail(email: string): Promise<User | null>
  abstract create(user: User, config?: ConfigT): Promise<void>
  abstract findById(id: string): Promise<User | null>
}
