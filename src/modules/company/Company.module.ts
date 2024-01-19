import { DatabaseModule } from '@infra/database/Database.module'
import { Module } from '@nestjs/common'
import { CreateCompanyService } from './services/CreateCompany.service'
import { CreateCompanyController } from './controllers/CreateCompany.controller'

@Module({
  imports: [DatabaseModule],
  providers: [CreateCompanyService],
  controllers: [CreateCompanyController],
})
export class CompanyModule {}
