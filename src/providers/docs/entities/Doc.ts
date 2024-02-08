import { ValueObject } from '@shared/core/entities/ValueObject'
import { Optional } from '@shared/core/types/Optional'
import { DocLine, DocLineProps } from './DocLine'

export enum DocType {
  PDF = '.pdf',
}

export interface DocProps {
  lines: DocLine[]
  name: string
  type: DocType
}

export class Doc extends ValueObject<DocProps> {
  static create(props: Optional<DocProps, 'lines'>) {
    const docProps: DocProps = {
      ...props,
      lines: [],
    }

    const doc = new Doc(docProps)

    return doc
  }

  get name() {
    return this.props.name
  }

  set name(name: string) {
    this.props.name = name
  }

  get type() {
    return this.props.type
  }

  set type(type: DocType) {
    this.props.type = type
  }

  get lines() {
    return this.props.lines
  }

  public addLine(line: Optional<DocLineProps, 'yPosition' | 'columns'> = {}) {
    const lastLine = this.lines[this.lines.length - 1]
    const docLine = DocLine.create({
      columns: line.columns ?? [],
      yPosition: line.yPosition
        ? line.yPosition
        : lastLine
          ? lastLine.yPosition + 6
          : 10,
    })
    this.props.lines.push(docLine)
    return docLine
  }
}
