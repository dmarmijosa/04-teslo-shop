import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Socket, Server } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  constructor(private readonly messagesWsService: MessagesWsService) {}

  handleConnection(client: Socket) {
    console.log(client.handshake.headers.authentication);
    this.messagesWsService.registerClient(client);
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
      fullName: 'YO',
      message: payload.message || 'no message !!',
    });
  }
}
