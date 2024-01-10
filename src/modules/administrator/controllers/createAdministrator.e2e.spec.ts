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
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'
import request from 'supertest'

describe('Create administrator (E2E)', () => {
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
    makeAdministrator = moduleRef.get(MakeAdministrator)
    hasherGenerator = moduleRef.get(HashGenerator)
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

  test('[POST] /administrators [201]', async () => {
    const response = await request(app.getHttpServer())
      .post('/administrators')
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

    const administratorOnDatabase = await prisma.collaborator.findUnique({
      where: {
        login: 'jonas12',
      },
    })

    expect(administratorOnDatabase).toBeTruthy()
  })

  test('[POST] /administrators [409]', async () => {
    const response = await request(app.getHttpServer())
      .post('/administrators')
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
      .post('/administrators')
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

    const administratorsOnDatabase = await prisma.collaborator.count({
      where: {
        type: 'ADMINISTRATOR',
      },
    })
    expect(administratorsOnDatabase).toEqual(2)
  })

  test('[POST] /administrators [403]', async () => {
    const invalidToken = await encrypter.encrypt({
      sub: master.id.toString(),
      role: AdministratorRole.VIEWER,
      type: 'ADMINISTRATOR',
    })

    const response = await request(app.getHttpServer())
      .post('/administrators')
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

    const administratorsOnDatabase = await prisma.collaborator.count({
      where: {
        type: 'ADMINISTRATOR',
      },
    })
    expect(administratorsOnDatabase).toEqual(2)
  })
})
