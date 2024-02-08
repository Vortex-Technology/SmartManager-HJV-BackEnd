import { Module } from '@nestjs/common'
import { DocGenerator } from './contracts/DocGenerator'
import { DocSM } from './implementations/DocSM'
import { DocPersistence } from './contracts/DocPersistence'

@Module({
  providers: [
    {
      provide: DocGenerator,
      useClass: DocSM,
    },
    {
      provide: DocPersistence,
      useClass: DocSM,
    },
  ],
  exports: [DocGenerator, DocPersistence],
})
export class DocModule { }
