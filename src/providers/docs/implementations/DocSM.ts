import JsPdf from 'jspdf'
import { DocGenerator } from '../contracts/DocGenerator'
import { DocPersistence } from '../contracts/DocPersistence'
import { Doc, DocType } from '../entities/Doc'
import path from 'path'
import fs from 'fs'

export class DocSM implements DocGenerator, DocPersistence {
  async savePdf(doc: Doc): Promise<void> {
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

    pdf.save(
      path.join(__dirname, '..', '..', '..', '..', 'temp', `${doc.name}.pdf`),
    )
  }

  generate(name: string, type: DocType): Doc {
    const doc = Doc.create({
      name,
      type,
    })

    return doc
  }
}
