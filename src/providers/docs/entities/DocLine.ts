import { ValueObject } from '@shared/core/entities/ValueObject'
import { Optional } from '@shared/core/types/Optional'
import { DocColumn, DocColumnProps } from './DocColumn'

export interface DocLineProps {
  yPosition: number
  columns: DocColumn[]
}

export class DocLine extends ValueObject<DocLineProps> {
  static create(props: Optional<DocLineProps, 'columns'>) {
    return new DocLine({ ...props, columns: props.columns || [] })
  }

  get yPosition() {
    return this.props.yPosition
  }

  get columns() {
    return this.props.columns
  }

  addColumn(
    column: Optional<DocColumnProps, 'xPosition' | 'fontSize' | 'text'> = {},
  ) {
    const lastColumn = this.columns[this.columns.length - 1]
    const docColumn = DocColumn.create({
      text: column.text ?? '',
      fontSize: column.fontSize,
      xPosition: column.xPosition
        ? column.xPosition
        : lastColumn
          ? lastColumn.xPosition + 30
          : 5,
    })

    this.props.columns.push(docColumn)
    return docColumn
  }
}
