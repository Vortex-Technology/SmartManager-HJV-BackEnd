import { Doc, DocType } from '../entities/Doc'

export abstract class DocGenerator {
  abstract generate(name: string, type: DocType): Doc
}
