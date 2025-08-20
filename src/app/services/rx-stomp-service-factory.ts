import { RxStomp } from '@stomp/rx-stomp';

export function rxStompServiceFactory() {
  const rxStomp = new RxStomp();
  return rxStomp;
}