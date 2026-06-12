import { Namespace, Socket } from 'socket.io';
import { redis } from '../../config/redis';
import pool from '../../db/pool';
import { ServerToClientEvents, ClientToServerEvents, SocketData, JoinRoomPayload, } from '../../types';

type GameNamespace = Namespace<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

export const handleConnection = (namespace: GameNamespace, socket: GameSocket) => {

  // EVENT: join_room 
  // Fired when a player enters a PIN and nickname on the join screen
  socket.on('join_room', async (payload: JoinRoomPayload) => {

    const { pin, nickname } = payload;

    try {
      // 1. Validate the session PIN against the database
      const sessionResult = await pool.query(
        `SELECT id, host_id, status FROM game_sessions WHERE pin = $1 LIMIT 1`, [pin]);

      if (sessionResult.rows.length === 0) {
        socket.emit('error', 'Invalid game PIN. Please check and try again.');
        return;
      }

      const session = sessionResult.rows[0];

      if (session.status !== 'lobby_waiting') {
        socket.emit('error', 'This game has already started or has ended.');
        return;
      }

      // 2. Insert participant into the database to get a persistent playerId
      const participantResult = await pool.query(
        `INSERT INTO participants (session_id, nickname, score)
         VALUES ($1, $2, 0) ON CONFLICT DO NOTHING RETURNING id`, [session.id, nickname]
      );

      if (participantResult.rows.length === 0) { //participant already exist.
        socket.emit('error', 'Nickname already taken in this session. Please choose another.');
        return;
      }

      const playerId = participantResult.rows[0].id;

      // 3. Store per-socket metadata on the socket object itself
      socket.data.playerId = playerId;
      socket.data.pin = pin;
      socket.data.nickname = nickname;

      // 4. Register presence in Redis
      // Add to the room's presence Set
      // Store socket info in a Hash for fast disconnect lookup
      // Also store player:{playerId}:meta so endQuestion can resolve nicknames
      // without hitting PostgreSQL once per player (N+1 query problem).
      await Promise.all([
        redis.sadd(`room:${pin}:presence`, playerId.toString()),
        redis.hset(`socket:${socket.id}`, {
          playerId: playerId.toString(),
          pin,
          nickname,
        }),
        redis.expire(`socket:${socket.id}`, 86400), // 24h TTL
        redis.hset(`player:${playerId}:meta`, { nickname }),
        redis.expire(`player:${playerId}:meta`, 86400), // 24h TTL
      ]);

      // 5. Join the Socket.IO room for this PIN
      socket.join(pin);

      // 6. Get total player count from Redis
      const totalPlayers = await redis.scard(`room:${pin}:presence`);

      // 7. Notify all sockets in the room including host.
      namespace.to(pin).emit('player_joined', {
        playerId, nickname, totalPlayers,
      });

      console.log(`[Socket] Player "${nickname}" (id:${playerId}) joined room ${pin}`);

    }

    catch (err) {
      console.error('[Socket] join_room error:', err);
      socket.emit('error', 'An internal error occurred while joining the room.');
    }

  });

  // EVENT: join_as_host
  // Fired by the quiz host's browser after they create a game session via the REST API.
  // The host joins the Socket.IO room so they can:
  //   - See player_joined events as players enter the lobby
  //   - Emit start_game when ready
  //   - Receive question_start / question_end / game_over alongside everyone else
  socket.on('join_as_host', async ({ pin, hostId }) => {

    try {

      // 1. Verify this hostId actually owns the session with this PIN
      const sessionResult = await pool.query(
        `SELECT id, host_id, status FROM game_sessions WHERE pin = $1 LIMIT 1`, [pin]
      );

      if (sessionResult.rows.length === 0) {
        socket.emit('error', 'Invalid game PIN.');
        return;
      }

      const session = sessionResult.rows[0];

      if (session.host_id !== hostId) {
        socket.emit('error', 'You are not the host of this session.');
        return;
      }

      // 2. Store host identity on the socket
      //    game.handler.ts checks socket.data.hostId before allowing start_game
      socket.data.hostId = hostId;
      socket.data.pin    = pin;

      // 3. Join the Socket.IO room (same room key as players, different role)
      socket.join(pin);

      // 4. Get current player count so host dashboard can render the lobby
      const totalPlayers = await redis.scard(`room:${pin}:presence`);

      // 5. Confirm to the host they are in
      socket.emit('joined_as_host', { pin, totalPlayers });

      console.log(`[Socket] Host (id:${hostId}) joined room ${pin}. Players in lobby: ${totalPlayers}`);

    } catch (err) {
      console.error('[Socket] join_as_host error:', err);
      socket.emit('error', 'An internal error occurred while joining as host.');
    }

  });

};

