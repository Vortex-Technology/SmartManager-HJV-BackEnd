import { Doc } from '../entities/Doc'

export abstract class DocPersistence {
  abstract savePdf(doc: Doc): Promise<void>
}
