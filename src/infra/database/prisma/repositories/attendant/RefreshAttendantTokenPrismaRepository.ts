import { RefreshAttendantToken } from '@modules/attendant/entities/RefreshAttendantToken'
import { RefreshAttendantTokenRepository } from '@modules/attendant/repositories/RefreshAttendantTokenRepository'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../index.service'
import { RefreshAttendantTokenPrismaMapper } from './RefreshAttendantTokenPrismaMapper'

@Injectable()
export class RefreshAttendantTokenPrismaRepository
  implements RefreshAttendantTokenRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(refreshAttendantToken: RefreshAttendantToken): Promise<void> {
    await this.prisma.refreshToken.create({
      data: RefreshAttendantTokenPrismaMapper.toPrisma(refreshAttendantToken),
    })
  }
}
