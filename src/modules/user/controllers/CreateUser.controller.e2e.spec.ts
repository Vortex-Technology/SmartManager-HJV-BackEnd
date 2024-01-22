import { Test } from '@nestjs/testing'
import { PrismaService } from '@infra/database/prisma/index.service'
import { INestApplication } from '@nestjs/common'
import { statusCode } from 'src/config/statusCode'
import request from 'supertest'
import { AppModule } from '@infra/App.module'
import { DatabaseModule } from '@infra/database/Database.module'

describe('Create user (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  test('[POST] /users [201]', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'jonas@jonas.com',
        name: 'Jonas',
        password: '12345678',
      })
      .timeout({ deadline: 60000, response: 60000 })

    expect(response.statusCode).toEqual(statusCode.Created)
    expect(response.headers).toEqual(
      expect.objectContaining({
        'x-location': expect.any(String),
      }),
    )

    const userOnDatabase = await prisma.user.findFirst({
      where: {
        email: 'jonas@jonas.com',
      },
    })

    expect(userOnDatabase).toBeTruthy()
  })

  test('[POST] /users [409]', async () => {
    // Existent seller
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'jonas@jonas.com',
        name: 'Jonas',
        password: '12345678',
      })
      .timeout({ deadline: 60000, response: 60000 })

    expect(response.statusCode).toEqual(statusCode.Conflict)
  })
})
