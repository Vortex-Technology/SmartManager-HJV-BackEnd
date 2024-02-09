import JsPdf from 'jspdf'
import path from 'path'
import fs from 'fs'
import { DocPersistence } from '@providers/docs/contracts/DocPersistence'
import { DocGenerator } from '@providers/docs/contracts/DocGenerator'
import { Doc, DocType } from '@providers/docs/entities/Doc'

export class FakeDocSM implements DocGenerator, DocPersistence {
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

    return filename
  }

  generate(name: string, type: DocType): Doc {
    const doc = Doc.create({
      name,
      type,
    })

    return doc
  }
}
