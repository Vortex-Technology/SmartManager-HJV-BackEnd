import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { MakeUser } from '@test/factories/modules/user/makeUser'
import { AppModule } from '@infra/App.module'
import { CryptographyModule } from '@providers/cryptography/Cryptography.module'
import { DatabaseModule } from '@infra/database/Database.module'

describe('Generate api key company (E2E)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, CryptographyModule, DatabaseModule],
      providers: [MakeUser, DatabaseModule],
    }).compile()

    app = moduleRef.createNestApplication()

    await app.init()
  })

  test.skip('[GET] /companies/:companyId/apiKeys/generate [201]')
})
