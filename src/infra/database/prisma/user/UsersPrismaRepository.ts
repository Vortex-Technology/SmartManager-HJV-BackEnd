import { User } from '@modules/user/entities/User'
import { UsersRepository } from '@modules/user/repositories/UsersRepository'
import { Injectable } from '@nestjs/common'
import { PrismaConfig, PrismaService } from '../index.service'
import { UsersPrismaMapper } from './UsersPrismaMapper'

@Injectable()
export class UsersPrismaRepository implements UsersRepository<PrismaConfig> {
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

  async create(user: User, config?: PrismaConfig): Promise<void> {
    const prisma = config ? config.prisma : this.prisma

    await prisma.user.create({
      data: UsersPrismaMapper.toPrisma(user),
    })
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    })

    if (!user) return null

    return UsersPrismaMapper.toEntity(user)
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.id.toString() },
      data: UsersPrismaMapper.toPrisma(user),
    })
  }
}
