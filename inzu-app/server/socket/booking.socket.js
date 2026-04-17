module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Client can join a specific property room to get targeted updates
    socket.on('join_property', (propertyId) => {
      socket.join(`property_${propertyId}`);
    });

    socket.on('leave_property', (propertyId) => {
      socket.leave(`property_${propertyId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};
