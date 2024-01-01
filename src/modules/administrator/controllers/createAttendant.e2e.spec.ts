import { Test } from '@nestjs/testing'
import { PrismaService } from '@infra/database/prisma/index.service'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@infra/app.module'
import { statusCode } from 'src/config/statusCode'
import { CryptographyModule } from '@providers/cryptography/cryptography.module'
import { HashGenerator } from '@providers/cryptography/contracts/hashGenerator'
import { Encrypter } from '@providers/cryptography/contracts/encrypter'
import { DatabaseModule } from '@infra/database/database.module'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import { Administrator, AdministratorRole } from '../entities/Administrator'
import { MakeAdministrator } from '@test/factories/modules/administrator/makeAdministrator'
import request from 'supertest'

describe('Create attendant (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let makeAdministrator: MakeAdministrator
  let hasherGenerator: HashGenerator
  let encrypter: Encrypter
  let master: Administrator
  let token: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule],
      providers: [MakeAdministrator],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    hasherGenerator = moduleRef.get(HashGenerator)
    makeAdministrator = moduleRef.get(MakeAdministrator)
    encrypter = moduleRef.get(Encrypter)

    const hashedPassword = await hasherGenerator.hash('12345678')

    master = await makeAdministrator.create({
      name: 'master',
      login: 'master',
      role: AdministratorRole.MASTER,
      password: hashedPassword,
    })

    token = await encrypter.encrypt({
      sub: master.id.toString(),
      role: master.role,
      type: 'ADMINISTRATOR',
    })

    await app.init()
  })

  test('[POST] /attendant [201]', async () => {
    const response = await request(app.getHttpServer())
      .post('/attendant')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        name: 'Jonas',
        login: 'jonas12',
        password: 'jonas12345',
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Created)
    expect(response.headers.location).toBeTruthy()

    const attendantOnDatabase = await prisma.collaborator.findUnique({
      where: {
        login: 'jonas12',
        type: 'ATTENDANT',
      },
    })

    expect(attendantOnDatabase).toBeTruthy()
  })

  test('[POST] /attendant [409]', async () => {
    const response = await request(app.getHttpServer())
      .post('/attendant')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        name: 'Jonas',
        login: 'jonas12',
        password: 'jonas12345',
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Conflict)

    const invalidToken = await encrypter.encrypt({
      // A random inexistent uuid
      sub: new UniqueEntityId().toString(),
      role: master.role,
      type: 'ADMINISTRATOR',
    })

    const response2 = await request(app.getHttpServer())
      .post('/attendant')
      .set({
        Authorization: `Bearer ${invalidToken}`,
      })
      .send({
        name: 'Amauri',
        login: 'ama12',
        password: '12345678',
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response2.statusCode).toEqual(statusCode.Conflict)

    const attendantsOnDatabase = await prisma.collaborator.count({
      where: {
        type: 'ATTENDANT',
      },
    })
    expect(attendantsOnDatabase).toEqual(1)
  })

  test('[POST] /attendant [403]', async () => {
    const invalidToken = await encrypter.encrypt({
      sub: master.id.toString(),
      role: AdministratorRole.VIEWER,
      type: 'ADMINISTRATOR',
    })

    const response = await request(app.getHttpServer())
      .post('/attendant')
      .set({
        Authorization: `Bearer ${invalidToken}`,
      })
      .send({
        name: 'Filipe',
        login: 'filipe12',
        password: '12345678',
      })
      .timeout({ deadline: 10000, response: 10000 })

    expect(response.statusCode).toEqual(statusCode.Forbidden)

    const attendantsOnDatabase = await prisma.collaborator.count({
      where: {
        type: 'ATTENDANT',
      },
    })
    expect(attendantsOnDatabase).toEqual(1)
  })
})
