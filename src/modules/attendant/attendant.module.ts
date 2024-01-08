import { DatabaseModule } from '@infra/database/database.module'
import { EnvModule } from '@infra/env/env.module'
import { Module } from '@nestjs/common'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { DateModule } from '@providers/date/date.module'
import { LoginAttendantService } from './services/loginAttendant.service'
import { LoginAttendantController } from './controllers/loginAttendant.controller'
import { GetAttendantController } from './controllers/getAttendant.controller'
import { GetAttendantService } from './services/getAttendant.service'

@Module({
  controllers: [LoginAttendantController, GetAttendantController],
  imports: [DatabaseModule, CryptographyModule, EnvModule, DateModule],
  providers: [LoginAttendantService, GetAttendantService],
})
export class AttendantModule {}
