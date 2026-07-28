import http from 'http';
import app from './app';
import dotenv from 'dotenv';
import prisma from './config/db';
import { Server } from 'socket.io';
import directorRoutes from './routes/director.routes';
import cashiersRoutes from './routes/cashiers.routes';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    
    server.listen(PORT, () => {
      console.log(`Enterprise LMS V2 API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
