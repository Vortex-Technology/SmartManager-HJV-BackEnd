import { Module } from '@nestjs/common'
import { DatabaseModule } from '@infra/database/Database.module'

@Module({
  controllers: [],
  imports: [DatabaseModule],
  providers: [],
})
export class ProductModule {}
