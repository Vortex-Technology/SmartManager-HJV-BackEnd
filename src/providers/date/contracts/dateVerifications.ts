export abstract class DateVerifications {
  abstract isBefore(props: { startDate?: Date; endDate: Date }): boolean
}
