/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  WsException,
} from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Socket, Server } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }
    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClientes(),
    );
  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);
    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClientes(),
    );
  }

  @SubscribeMessage('message-from-client')
  OnMessageFromClient(cliente: Socket, payload: NewMessageDto) {
    /**cliente.emit('message-from-server', {
      fullName: 'YO',
      message: payload.message || 'no message !!',
    });**/
    // cliente.broadcast.emit('message-from-server', {
    //   fullName: 'YO',
    //   message: payload.message || 'no message !!',
    // });

    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullNameBySocketId(cliente.id),
      message: payload.message || 'no message !!',
    });
  }
}
