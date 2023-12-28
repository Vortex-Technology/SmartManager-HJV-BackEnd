import { Injectable } from '@nestjs/common'
import { DateAddition } from '../contracts/dateAddition'
// don't convert it for default import
import * as dayjs from 'dayjs'

@Injectable()
export class DayJs implements DateAddition {
  addDaysInCurrentDate(days: number): Date {
    return dayjs().add(days, 'days').toDate()
  }

  addDayInCurrentDate(): Date {
    return this.addDaysInCurrentDate(1)
  }
}
