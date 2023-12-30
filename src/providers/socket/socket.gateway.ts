import { EnvService } from '@infra/env/env.service'
import { Injectable } from '@nestjs/common'
import {
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'

@Injectable()
@WebSocketGateway({
  transports: ['websocket', 'polling'],
  cors: {
    origin: 'http://localhost:1212',
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer() server!: Server

  constructor(private readonly env: EnvService) {}

  async afterInit(server: Server) {
    const runningInEnv = this.env.get('NODE_ENV')
    const socketPort = this.env.get('SOCKET_PORT')

    this.server = server

    if (runningInEnv === 'test') {
      const testPort = await this.findAvailablePort()
      server.listen(testPort)
      return console.log(`Socket server running on port ${testPort}`)
    }

    server.listen(socketPort)
    console.log(`Socket server running on port ${socketPort}`)
  }

  async findAvailablePort(
    startingPort = 3006,
    maxAttempts = 100,
  ): Promise<number> {
    let port = startingPort
    let attempts = 0

    while (attempts < maxAttempts) {
      if (await this.isPortAvailable(port)) {
        return port
      }

      port++
      attempts++
    }

    throw new Error('Unable to find an available port for WebSocket tests')
  }

  async isPortAvailable(port: number): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const server = createServer()

      server.once('error', () => {
        resolve(false)
      })

      server.once('listening', () => {
        server.close()
        resolve(true)
      })

      server.listen(port, '127.0.0.1')
    })
  }

  // temporary
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    console.log('ping')
    client.emit('pong')
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    // temporary
    console.log(client.id)
  }
}
