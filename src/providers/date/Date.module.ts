import { Module } from '@nestjs/common'
import { DateAddition } from './contracts/dateAddition'
import { DayJs } from './implementations/dayJs'
import { DateVerifications } from './contracts/dateVerifications'

@Module({
  providers: [
    {
      provide: DateAddition,
      useClass: DayJs,
    },
    {
      provide: DateVerifications,
      useClass: DayJs,
    },
  ],
  exports: [DateAddition, DateVerifications],
})
export class DateModule {}
