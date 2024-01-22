import 'newrelic'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './App.module'
import { EnvService } from './env/Env.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: false,
    cors: {
      origin: 'http://localhost:1212',
      credentials: true,
    },
  })

  const envService = app.get(EnvService)
  const port = envService.get('PORT')

  await app.listen(port)
}

bootstrap()
