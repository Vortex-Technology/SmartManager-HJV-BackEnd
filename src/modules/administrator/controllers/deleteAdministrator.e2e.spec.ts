import { Test } from '@nestjs/testing'
import { PrismaService } from '@infra/database/prisma/index.service'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@infra/app.module'
import { statusCode } from 'src/config/statusCode'
import { MakeAdministrator } from '@test/factories/modules/administrator/makeAdministrator'
import { Administrator, AdministratorRole } from '../entities/Administrator'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { DatabaseModule } from '@infra/database/database.module'
import request from 'supertest'

describe('Delete administrator (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let makeAdministrator: MakeAdministrator
  let hasherGenerator: HashGenerator
  let encrypter: Encrypter
  let excluder: Administrator
  let administrator: Administrator
  let token: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule],
      providers: [MakeAdministrator],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    makeAdministrator = moduleRef.get(MakeAdministrator)
    hasherGenerator = moduleRef.get(HashGenerator)
    encrypter = moduleRef.get(Encrypter)

    const hashedPassword = await hasherGenerator.hash('12345678')

    excluder = await makeAdministrator.create({
      name: 'excluder',
      login: 'excluder',
      role: AdministratorRole.FULL_ACCESS,
      password: hashedPassword,
    })

    administrator = await makeAdministrator.create({
      role: AdministratorRole.VIEWER,
    })

    token = await encrypter.encrypt({
      sub: excluder.id.toString(),
      role: excluder.role,
      type: 'ADMINISTRATOR',
    })

    await app.init()
  })

  test('[DELETE] /administrators/:id [204]', async () => {
    const idOfAdministratorToDelete = administrator.id.toString()

    const response = await request(app.getHttpServer())
      .delete(`/administrators/${idOfAdministratorToDelete}`)
      .set({
        Authorization: `Bearer ${token}`,
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.NoContent)

    const administratorOnDatabase = await prisma.collaborator.findUnique({
      where: {
        id: idOfAdministratorToDelete,
      },
    })

    expect(administratorOnDatabase).toBeTruthy()
    expect(administratorOnDatabase?.deletedAt).toBeInstanceOf(Date)
  })

  test('[DELETE] /administrators/:id [404]', async () => {
    const idOfAdministratorToDelete = administrator.id.toString()

    const response = await request(app.getHttpServer())
      .delete(`/administrators/${idOfAdministratorToDelete}`)
      .set({
        Authorization: `Bearer ${token}`,
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.NotFound)
  })
})
