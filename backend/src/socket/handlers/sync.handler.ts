import { Socket } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents, SocketData } from '../../types';

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

export const handleSync = (socket: GameSocket): void => {

  // EVENT: sync_time
  // The client sends its own local timestamp (t0) so the server can help it
  // calculate the network lag and adjust its visual countdown timer.
  //
  // How the client will use these values:
  //   t3       = Date.now() when the client receives this reply
  //   latency  = ((t3 - t0) - (t2 - t1)) / 2    → one-way network delay
  //   offset   = ((t1 - t0) + (t2 - t3)) / 2    → how far the client clock is off from server
  //   syncedTime = Date.now() + offset            → the client's "true" time
  //
  // When the server broadcasts T_deadline for a question, the client renders
  // its countdown using syncedTime instead of its raw local clock.

  socket.on('sync_time', ({ t0 }) => {

    const t1 = Date.now(); // server ingestion time — mark it immediately

    // t2 is stamped as late as possible (just before the packet leaves)
    // so the gap (t2 - t1) reflects only server processing time, not queuing
    const t2 = Date.now();

    socket.emit('sync_time_response', { t0, t1, t2 });

  });

};
