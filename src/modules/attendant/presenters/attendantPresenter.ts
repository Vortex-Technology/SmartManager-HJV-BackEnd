import { Attendant } from '../entities/Attendant'

export class AttendantPresenter {
  static toHTTP(attendant: Attendant) {
    return {
      id: attendant.id.toString(),
      name: attendant.name,
      image: {
        url: attendant.image,
        alt: attendant.name,
      },
    }
  }
}
