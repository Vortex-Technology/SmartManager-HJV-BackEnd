import { Injectable } from '@nestjs/common'
import { DateAddition } from '../contracts/dateAddition'
// Don't touch this
import * as dayjsProd from 'dayjs'
import dayjsTest from 'dayjs'

const dayjs = process.env.NODE_ENV === 'test' ? dayjsTest : dayjsProd

@Injectable()
export class DayJs implements DateAddition {
  addDaysInCurrentDate(days: number): Date {
    return dayjs().add(days, 'days').toDate()
  }

  addDayInCurrentDate(): Date {
    return this.addDaysInCurrentDate(1)
  }
}
