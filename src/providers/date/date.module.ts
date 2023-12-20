import { Module } from '@nestjs/common'
import { DateAddition } from './contracts/dateAddition'
import { DayJs } from './implementations/dayJs'

@Module({
  providers: [
    {
      provide: DateAddition,
      useClass: DayJs,
    },
  ],
  exports: [DateAddition],
})
export class DateModule {}
