import { OrdersProductsVariantsRepository } from '@modules/order/repositories/OrdersProductsVariantsRepository'
import { PrismaConfig, PrismaService } from '../index.service'
import { OrderProductVariant } from '@modules/order/entities/OrderProductVariant'
import { Injectable } from '@nestjs/common'
import { OrdersProductsVariantsPrismaMapper } from './OrdersProductsVariantsPrismaMapper'

@Injectable()
export class OrdersProductsVariantsPrimaRepository
  implements OrdersProductsVariantsRepository<PrismaConfig>
{
  constructor(private readonly prisma: PrismaService) {}

  async createMany(
    orderProductsVariants: OrderProductVariant[],
    config?: PrismaConfig,
  ): Promise<void> {
    const prisma = config ? config.prisma : this.prisma

    await prisma.orderProductsVariants.createMany({
      data: orderProductsVariants.map(
        OrdersProductsVariantsPrismaMapper.toPrisma,
      ),
    })
  }
}
