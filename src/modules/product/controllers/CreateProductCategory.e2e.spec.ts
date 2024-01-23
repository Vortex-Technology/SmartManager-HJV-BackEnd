import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { statusCode } from '@config/statusCode'
import request from 'supertest'
import { AppModule } from '@infra/App.module'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { DatabaseModule } from '@infra/database/Database.module'

describe('Create product category (E2E)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule],
      providers: [],
    }).compile()

    app = moduleRef.createNestApplication()

    await app.init()
  })

  test.skip('[POST] /products/categories [201]', async () => {
    const response = await request(app.getHttpServer())
      .post('/products/categories')
      .set({
        Authorization: `Bearer ${'token'}`,
      })
      .send({
        name: 'product category',
        description: 'A new product category to test the creation',
      })
      .timeout({ deadline: 60000, response: 60000 })

    expect(response.statusCode).toEqual(statusCode.Created)
    expect(response.headers.location).toBeTruthy()
  })

  test.skip('[POST] /products/categories [409]', async () => {
    const response = await request(app.getHttpServer())
      .post('/products/categories')
      .set({
        Authorization: `Bearer ${'token'}`,
      })
      .send({
        name: 'product category',
        description: 'A new product category to test the creation',
      })
      .timeout({ deadline: 60000, response: 60000 })

    expect(response.statusCode).toEqual(statusCode.Conflict)
  })

  test.skip('[POST] /products/categories [403]', async () => {
    const response = await request(app.getHttpServer())
      .post('/products/categories')
      .set({
        Authorization: `Bearer ${'invalidToken'}`,
      })
      .send({
        name: 'product category 3',
        description: 'A new product category to test the creation',
      })
      .timeout({ deadline: 60000, response: 60000 })

    expect(response.statusCode).toEqual(statusCode.Forbidden)
  })
})
