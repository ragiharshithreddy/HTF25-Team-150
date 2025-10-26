const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const fileUpload = require('express-fileupload');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);
module.exports.io = io;

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.bold);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// File upload
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  abortOnLimit: true
}));

// Sanitize data
app.use(mongoSanitize());
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later'
});

app.use('/api', limiter);

// Prevent http param pollution
app.use(hpp());

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const superadminRoutes = require('./routes/superadmin');

// Super Admin Mode - Only expose superadmin routes
if (process.env.SUPER_ADMIN_MODE === 'true') {
  console.log('🔐 Running in SUPER ADMIN MODE - Limited routes enabled'.magenta.bold);
  
  // Mount only super admin routes
  app.use('/api/auth', authRoutes);
  app.use('/api/superadmin', superadminRoutes);
  
} else {
  // Normal mode - All routes available except super admin critical endpoints
  console.log('🚀 Running in NORMAL MODE - Full application routes enabled'.cyan.bold);
  
  const studentRoutes = require('./routes/students');
  const adminRoutes = require('./routes/admin');
  const projectRoutes = require('./routes/projects');
  const applicationRoutes = require('./routes/applications');
  const resumeRoutes = require('./routes/resumes');
  const testRoutes = require('./routes/tests');
  const certificateRoutes = require('./routes/certificates');
  const notificationRoutes = require('./routes/notifications');
  const companyRoutes = require('./routes/companies');
  
  // Mount routes
  app.use('/api/auth', authRoutes);
  app.use('/api/superadmin', superadminRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/resumes', resumeRoutes);
  app.use('/api/tests', testRoutes);
  app.use('/api/certificates', certificateRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/companies', companyRoutes);
}

// Error handler middleware (must be after routes)
const errorHandler = require('./middleware/error');
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`.green);

  // Join test room
  socket.on('join-test', (attemptId) => {
    socket.join(attemptId);
    console.log(`Socket ${socket.id} joined test room: ${attemptId}`);
  });

  // Handle violations
  socket.on('violation-detected', async (data) => {
    console.log('Violation detected:', data);
    // Handle anti-cheat violation
    io.to(data.attemptId).emit('anti-cheat-warning', {
      warning: true,
      details: data
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`.yellow);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`.red.bold);
  httpServer.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully...');
  httpServer.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});
