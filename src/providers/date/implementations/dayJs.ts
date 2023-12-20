import { Injectable } from '@nestjs/common'
import { DateAddition } from '../contracts/dateAddition'
import dayjs from 'dayjs'

@Injectable()
export class DayJs implements DateAddition {
  addDaysInCurrentDate(days: number): Date {
    return dayjs().add(days, 'days').toDate()
  }

  addDayInCurrentDate(): Date {
    return this.addDaysInCurrentDate(1)
  }
}
