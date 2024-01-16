import { User } from '@modules/user/entities/User'
import { UsersRepository } from '@modules/user/repositories/UsersRepository'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../index.service'
import { UsersPrismaMapper } from './UsersPrismaMapper'

@Injectable()
export class UsersPrismaRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!user) return null

    return UsersPrismaMapper.toEntity(user)
  }

  async create(user: User): Promise<void> {
    await this.prisma.user.create({
      data: UsersPrismaMapper.toPrisma(user),
    })
  }
}
