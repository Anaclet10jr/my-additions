const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const mongoose   = require('mongoose');
const cors       = require('cors');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000' }
});

app.use(cors());
app.use(express.json());

// Attach socket.io instance to every request
app.use((req, res, next) => { req.io = io; next(); });

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth.routes'));
app.use('/api/properties',  require('./routes/property.routes'));
app.use('/api/bookings',    require('./routes/booking.routes'));
app.use('/api/admin',       require('./routes/admin.routes'));

// Phase 3 routes
app.use('/api/real-estate', require('./routes/realEstate.routes'));
app.use('/api/services',    require('./routes/homeService.routes'));
app.use('/api/interior',    require('./routes/interiorDesign.routes'));

// ── Socket.IO ────────────────────────────────────────────────────────────────
require('./socket/booking.socket')(io);

// User-specific rooms so we can notify specific users
io.on('connection', (socket) => {
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
  });
  socket.on('disconnect', () => {});
});

// ── Database + Start ──────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Inzu server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => { console.error('MongoDB connection error:', err); process.exit(1); });
