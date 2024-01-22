import { DatabaseModule } from '@infra/database/Database.module'
import { Module } from '@nestjs/common'
import { CreateCompanyService } from './services/CreateCompany.service'
import { CreateCompanyController } from './controllers/CreateCompany.controller'
import { GenerateApiKeyCompanyController } from './controllers/GenerateApiKeyCompany.controller'
import { GenerateApiKeyCompanyService } from './services/GenerateApiKeyCompany.service'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  providers: [CreateCompanyService, GenerateApiKeyCompanyService],
  controllers: [CreateCompanyController, GenerateApiKeyCompanyController],
})
export class CompanyModule {}
