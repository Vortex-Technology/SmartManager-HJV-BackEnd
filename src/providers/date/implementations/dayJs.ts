import { Injectable } from '@nestjs/common'
import { DateAddition } from '../contracts/dateAddition'
// Don't touch this
import * as dayjsProd from 'dayjs'
import dayjsTest from 'dayjs'
import { DateVerifications } from '../contracts/dateVerifications'

const dayjs = process.env.NODE_ENV === 'test' ? dayjsTest : dayjsProd

@Injectable()
export class DayJs implements DateAddition, DateVerifications {
  addDaysInCurrentDate(days: number): Date {
    return dayjs().add(days, 'days').toDate()
  }

  addDayInCurrentDate(): Date {
    return this.addDaysInCurrentDate(1)
  }

  isBefore({
    startDate = new Date(),
    endDate,
  }: {
    startDate?: Date
    endDate: Date
  }): boolean {
    return dayjs(startDate).isBefore(endDate)
  }
}
