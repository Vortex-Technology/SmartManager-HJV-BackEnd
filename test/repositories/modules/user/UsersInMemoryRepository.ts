import { User } from '@modules/user/entities/User'
import { UsersRepository } from '@modules/user/repositories/UsersRepository'

export class UsersInMemoryRepository implements UsersRepository {
  users: User[] = []

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((user) => user.email === email)

    if (!user) return null

    return user
  }

  async create(user: User): Promise<void> {
    this.users.push(user)
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((user) => user.id.toString() === id)

    if (!user) return null

    return user
  }

  async save(user: User): Promise<void> {
    const userIndex = this.users.findIndex((existingUser) =>
      existingUser.equals(user),
    )
    console.log(userIndex)

    if (userIndex === -1) {
      throw new Error('User not found')
    }

    this.users[userIndex] = user
    console.log(this.users)
  }
}
