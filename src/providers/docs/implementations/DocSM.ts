import JsPdf from 'jspdf'
import { DocGenerator } from '../contracts/DocGenerator'
import { DocPersistence } from '../contracts/DocPersistence'
import { Doc, DocType } from '../entities/Doc'
import path from 'path'
import fs from 'fs'
import { Injectable } from '@nestjs/common'
import { StorageRepository } from '@infra/storage/contracts/StorageRepository'

@Injectable()
export class DocSM implements DocGenerator, DocPersistence {
  constructor(private readonly storagerepository: StorageRepository) { }

  async savePdf(doc: Doc): Promise<string | null> {
    if (doc.type !== DocType.PDF) {
      throw new Error('Invalid type')
    }

    const pdf = new JsPdf()
    pdf.setFont('helvetica', '', 700)

    const lines = doc.lines

    for (const line of lines) {
      const columns = line.columns

      for (const column of columns) {
        pdf.setFontSize(column.fontSize)
        pdf.text(column.text, column.xPosition, line.yPosition)
      }
    }

    const tempFolder = path.join(__dirname, '..', '..', '..', '..', 'temp')
    if (!fs.existsSync(tempFolder)) {
      fs.mkdirSync(tempFolder)
    }

    const filename = `${doc.name}.pdf`
    const filePath = path.join(tempFolder, filename)

    pdf.save(filePath)

    const url = await this.storagerepository.upload(filename)
    return url
  }

  generate(name: string, type: DocType): Doc {
    const doc = Doc.create({
      name,
      type,
    })

    return doc
  }
}
