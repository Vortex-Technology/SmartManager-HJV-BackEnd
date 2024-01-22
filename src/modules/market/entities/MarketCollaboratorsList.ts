import {
  Collaborator,
  CollaboratorRole,
} from '@modules/collaborator/entities/Collaborator'
import { WatchedList } from '@shared/core/entities/WatchedList'

export class MarketCollaboratorsList extends WatchedList<Collaborator> {
  compareItems(
    a: Collaborator<CollaboratorRole>,
    b: Collaborator<CollaboratorRole>,
  ): boolean {
    return a.equals(b)
  }
}
