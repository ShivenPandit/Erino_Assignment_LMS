const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 10000;

// Trust proxy configuration for Railway deployment
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration for Vercel proxy approach
app.use(cors({
  origin: true, // Allow all origins since Vercel proxy makes requests same-origin
  credentials: true, // This is crucial for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 204
}));

// Handle CORS preflight for all routes
app.options('*', cors());

// Cookie parsing middleware
app.use(cookieParser());

// Debug middleware to log all requests and cookies
app.use((req, res, next) => {
  console.log(`\n🔍 ${req.method} ${req.path}`);
  console.log('📋 Request cookies:', Object.keys(req.cookies || {}));
  console.log('🌐 Origin:', req.headers.origin);
  console.log('🔑 Authorization header:', !!req.headers.authorization);
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check request received');
  console.log('Request cookies:', Object.keys(req.cookies || {}));
  console.log('Request headers:', req.headers);
  
  res.status(200).json({ 
    status: 'OK', 
    message: 'Lead Management System API is running',
    timestamp: new Date().toISOString(),
    cookies: Object.keys(req.cookies || {}),
    userAgent: req.headers['user-agent']
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Lead Management System API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      leads: '/api/leads'
    },
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// Test authentication endpoint
app.get('/test-auth', (req, res) => {
  console.log('Test auth request received');
  console.log('Request cookies:', Object.keys(req.cookies || {}));
  console.log('Request headers:', req.headers);
  
  res.status(200).json({
    message: 'Test auth endpoint',
    cookies: Object.keys(req.cookies || {}),
    hasToken: !!(req.cookies && req.cookies.token),
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    // Let Railway handle the port binding automatically
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
      console.log(`📋 Leads API: http://localhost:${PORT}/api/leads`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
