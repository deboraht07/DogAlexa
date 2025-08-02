// Middleware functions for Animal Translator API
require('dotenv').config();  // ← ADD this if missing
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const app = express();  // ← This line should ALREADY be there
const PORT = process.env.PORT || 3001;  // ← And this one too


// Rate limiting for API endpoints
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message: 'Our animals need a break! Please try again later.',
      retryAfter: Math.ceil(windowMs / 1000 / 60) + ' minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Stricter rate limit for translation endpoint
const translationRateLimit = createRateLimit(5 * 60 * 1000, 20); // 20 requests per 5 minutes

// File upload configuration
const createUploadConfig = () => {
  const storage = multer.memoryStorage();
  
  const fileFilter = (req, file, cb) => {
    const allowedTypes = [
      'audio/wav',
      'audio/mp3', 
      'audio/mpeg',
      'audio/webm',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed. Our animals only understand certain formats!`), false);
    }
  };
  
  return multer({
    storage,
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
      files: 1
    },
    fileFilter
  });
};

// Error handling middleware
const errorHandler = (error, req, res, next) => {
  console.error('💥 Error:', error);
  
  // Multer errors
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Your audio file is too big! Our animals have small ears.',
        maxSize: '10MB'
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: error.message
    });
  }
  
  // Custom file type errors
  if (error.message.includes('File type')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: error.message
    });
  }
  
  // Default error
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong! Our hamsters fell off their wheels.'
  });
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${url} - ${ip}`);
  
  // Log file uploads
  if (req.file) {
    console.log(`📁 File upload: ${req.file.originalname} (${req.file.size} bytes)`);
  }
  
  next();
};

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000', // Local development
      'http://localhost:3001', // Local development
      /\.vercel\.app$/, // Vercel deployments
      /\.netlify\.app$/, // Netlify deployments
    ];
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      }
      return allowed.test(origin);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

module.exports = {
  createRateLimit,
  translationRateLimit,
  createUploadConfig,
  errorHandler,
  requestLogger,
  corsOptions
};