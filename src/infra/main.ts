import 'newrelic'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { EnvService } from './env/env.service'
import { createServer } from 'http'
import { IoAdapter } from '@nestjs/platform-socket.io'

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

  const server = createServer(app.getHttpAdapter().getInstance())

  const io = require('socket.io')(server, {
    cors: {
      origin: 'http://localhost:1212',
      credentials: true,
    },
  })

  app.useWebSocketAdapter(new IoAdapter(io))

  await app.listen(port)
}

bootstrap()
