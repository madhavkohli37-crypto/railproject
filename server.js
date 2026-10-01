const { createServer } = require('http');
const next = require('next');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const secret = process.env.JWT_SECRET || 'railassist_jwt_secret_key_2024';
const realtimeSecret = process.env.REALTIME_INTERNAL_SECRET;

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    if (req.method === 'POST' && req.url?.split('?')[0] === '/api/realtime/publish') {
      if (!realtimeSecret || req.headers.authorization !== `Bearer ${realtimeSecret}`) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }
      try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const message = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!message.event || !Array.isArray(message.rooms)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid realtime message' }));
          return;
        }
        for (const room of message.rooms) io.to(room).emit(message.event, message.payload);
        res.writeHead(202, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ delivered: true }));
      } catch (error) {
        console.error('[realtime] relay error:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
      return;
    }
    handle(req, res);
  });
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
    console.log(`[socket] connected user=${userId} role=${socket.user.role}`);
    socket.join(`user:${userId}`);
    if (socket.user.role === 'PROVIDER') socket.join(`provider:${userId}`);
    socket.on('booking:subscribe', bookingId => socket.join(`booking:${Number(bookingId)}`));
    socket.on('booking:unsubscribe', bookingId => socket.leave(`booking:${Number(bookingId)}`));
    // The browser re-fetches its authorized HTTP resource after reconnect.
    socket.on('booking:sync', callback => callback?.({ reload: true }));
    socket.on('disconnect', reason => console.log(`[socket] disconnected user=${userId} reason=${reason}`));
  });

  const port = Number(process.env.PORT || 3000);
  httpServer.listen(port, () => console.log(`> RailAssist ready on http://localhost:${port}`));
});
