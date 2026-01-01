const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Store connected clients by product ID
const productRooms = new Map();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join product room for real-time reviews
    socket.on('join-product', (productId) => {
      socket.join(`product-${productId}`);
      console.log(`Client ${socket.id} joined product room: ${productId}`);
    });

    // Leave product room
    socket.on('leave-product', (productId) => {
      socket.leave(`product-${productId}`);
      console.log(`Client ${socket.id} left product room: ${productId}`);
    });

    // Join products room for real-time product updates
    socket.on('join-products', () => {
      socket.join('products');
      console.log(`Client ${socket.id} joined products room`);
    });

    // Leave products room
    socket.on('leave-products', () => {
      socket.leave('products');
      console.log(`Client ${socket.id} left products room`);
    });

    // Handle new review submission
    socket.on('new-review', (data) => {
      const { productId, review } = data;
      console.log('New review received:', data);
      
      // Broadcast to all clients in the product room
      io.to(`product-${productId}`).emit('review-added', {
        productId,
        review,
        timestamp: new Date().toISOString()
      });
    });

    // Handle new product creation
    socket.on('new-product', (data) => {
      const { product } = data;
      console.log('New product received:', data);
      
      // Broadcast to all clients in products room
      io.to('products').emit('product-added', {
        product,
        timestamp: new Date().toISOString()
      });
    });

    // Handle product update
    socket.on('product-updated', (data) => {
      const { product } = data;
      console.log('Product updated:', data);
      
      // Broadcast to all clients in products room
      io.to('products').emit('product-updated', {
        product,
        timestamp: new Date().toISOString()
      });
    });

    // Handle product deletion
    socket.on('product-deleted', (data) => {
      const { productId } = data;
      console.log('Product deleted:', data);
      
      // Broadcast to all clients in products room
      io.to('products').emit('product-deleted', {
        productId,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server ready for real-time reviews`);
  });
});
