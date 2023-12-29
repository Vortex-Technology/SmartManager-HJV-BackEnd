import {
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway(3005, {
  transports: ['websocket', 'polling'],
  cors: {
    origin: 'http://localhost:1212',
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer() server!: Server

  afterInit(server: Server) {
    this.server = server
    console.log('Socket server running')
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
