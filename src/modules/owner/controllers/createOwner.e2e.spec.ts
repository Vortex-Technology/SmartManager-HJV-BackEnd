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
import request from 'supertest'
import { MakeMaster } from '@test/factories/modules/master/makeMaster'
import { Master } from '@modules/master/entities/Master'
import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'

describe('Create owner (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let makeMaster: MakeMaster
  let hasherGenerator: HashGenerator
  let encrypter: Encrypter
  let master: Master
  let token: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule],
      providers: [MakeMaster],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    makeMaster = moduleRef.get(MakeMaster)
    hasherGenerator = moduleRef.get(HashGenerator)
    encrypter = moduleRef.get(Encrypter)

    const hashedPassword = await hasherGenerator.hash('12345678')

    master = await makeMaster.create({
      name: 'master',
      login: 'master',
      password: hashedPassword,
    })

    token = await encrypter.encrypt({
      sub: master.id.toString(),
      role: master.role,
    })

    await app.init()
  })

  test('[POST] /owners [201]', async () => {
    const response = await request(app.getHttpServer())
      .post('/owners')
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

    const ownerOnDatabase = await prisma.collaborator.findFirst({
      where: {
        login: 'jonas12',
        role: CollaboratorRole.OWNER,
      },
    })

    expect(ownerOnDatabase).toBeTruthy()
  })

  test('[POST] /owners [409]', async () => {
    const response = await request(app.getHttpServer())
      .post('/owners')
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
    })

    const response2 = await request(app.getHttpServer())
      .post('/owners')
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

    const ownersOnDatabase = await prisma.collaborator.count({
      where: {
        role: CollaboratorRole.OWNER,
      },
    })
    expect(ownersOnDatabase).toEqual(1)
  })

  test('[POST] /owners [403]', async () => {
    const invalidToken = await encrypter.encrypt({
      sub: master.id.toString(),
      role: CollaboratorRole.STOCKIST,
    })

    const response = await request(app.getHttpServer())
      .post('/owners')
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

    const ownersOnDatabase = await prisma.collaborator.count({
      where: {
        role: CollaboratorRole.OWNER,
      },
    })
    expect(ownersOnDatabase).toEqual(1)
  })
})
