import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { RxStompConfig } from '@stomp/rx-stomp';
import { Message } from '@stomp/stompjs';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private rxStomp = new RxStomp();

  private config: RxStompConfig = {
    // ✅ Use raw WebSocket URL (no SockJS)
    brokerURL: 'ws://localhost:8084/ws',

    // ✅ Pass token in query param
    connectHeaders: {},

    // ✅ Custom WebSocket factory to include token
    webSocketFactory: () => {
      const token = localStorage.getItem('authToken');
      return new WebSocket(`ws://localhost:8084/ws?token=${token}`);
    },

    debug: (msg: string) => console.log('STOMP: ' + msg),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000
  };

  connect() {
    this.rxStomp.configure(this.config);
    this.rxStomp.activate(); // Connects
  }

subscribeToMeasurements(): Observable<Message> {
  return this.rxStomp.watch('/topic/new-measurement');
}
}