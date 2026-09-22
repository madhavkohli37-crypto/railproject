const { createServer } = require('http');
const next = require('next');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const secret = process.env.JWT_SECRET || 'railassist_jwt_secret_key_2024';

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server(httpServer, { path: '/api/socket.io', cors: { origin: true, credentials: true } });
  global._railassistSocketIO = io;

  io.use((socket, nextMiddleware) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');
      if (!token) return nextMiddleware(new Error('Authentication required'));
      socket.user = jwt.verify(token, secret);
      nextMiddleware();
    } catch { nextMiddleware(new Error('Invalid authentication token')); }
  });

  io.on('connection', socket => {
    const userId = socket.user.userId;
    socket.join(`user:${userId}`);
    if (socket.user.role === 'PROVIDER') socket.join(`provider:${userId}`);
    socket.on('booking:subscribe', bookingId => socket.join(`booking:${Number(bookingId)}`));
    socket.on('booking:unsubscribe', bookingId => socket.leave(`booking:${Number(bookingId)}`));
    // The browser re-fetches its authorized HTTP resource after reconnect.
    socket.on('booking:sync', callback => callback?.({ reload: true }));
  });

  const port = Number(process.env.PORT || 3000);
  httpServer.listen(port, () => console.log(`> RailAssist ready on http://localhost:${port}`));
});
