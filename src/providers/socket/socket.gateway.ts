import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets'
import { Server } from 'http'

@WebSocketGateway(3003)
export class SocketGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer() server!: Server

  afterInit() {
    console.log('Socket is running')
  }

  handleConnection(client: any, ...args: any[]) {
    console.log(client.id)
  }
}
