import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@shared/core/error/Either'
import { AttendantRepository } from '../repositories/AttendantRepository'
import { AttendantNotFount } from '../errors/AttendantNotFound'
import { Attendant } from '../entities/Attendant'

interface Request {
  attendantId: string
}

type Response = Either<
  AttendantNotFount,
  {
    attendant: Attendant
  }
>

@Injectable()
export class GetAttendantService {
  constructor(private readonly attendantRepository: AttendantRepository) {}

  async execute({ attendantId }: Request): Promise<Response> {
    const attendant = await this.attendantRepository.findById(attendantId)

    if (!attendant) {
      return left(new AttendantNotFount())
    }

    return right({
      attendant,
    })
  }
}
