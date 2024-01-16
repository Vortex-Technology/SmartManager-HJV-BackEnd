import { fakerPT_BR } from '@faker-js/faker'
import { PrismaService } from '@infra/database/prisma/index.service'
import { SellerPrismaMapper } from '@infra/database/prisma/seller/SellerPrismaMapper'
import { Seller, SellerProps } from '@modules/seller/entities/Seller'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export function makeSeller(
  override: Partial<SellerProps> = {},
  id?: UniqueEntityId,
): Seller {
  const seller = Seller.create(
    {
      login: fakerPT_BR.person.firstName(),
      name: fakerPT_BR.person.fullName(),
      password: fakerPT_BR.internet.password(),
      ...override,
    },
    id,
  )

  return seller
}

@Injectable()
export class MakeSeller {
  constructor(private readonly prisma: PrismaService) {}

  async create(override: Partial<SellerProps> = {}, id?: UniqueEntityId) {
    const seller = makeSeller(override, id)

    await this.prisma.collaborator.create({
      data: SellerPrismaMapper.toPrisma(seller),
    })

    return seller
  }
}
