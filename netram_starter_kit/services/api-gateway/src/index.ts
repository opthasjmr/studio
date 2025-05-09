import express, { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT_API_GATEWAY || 3000;

// Middleware
app.use(cors()); // Enable CORS
app.use(helmet()); // Set security-related HTTP headers
app.use(morgan('dev')); // HTTP request logger
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Service Routes ---
// These URLs should point to your running backend services.
// Update them based on your deployment or local development setup.
const services = [
  { route: '/auth', target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001' },
  { route: '/patients', target: process.env.PATIENT_SERVICE_URL || 'http://localhost:3002' },
  { route: '/emr', target: process.env.EMR_SERVICE_URL || 'http://localhost:3003' }, // Example
  { route: '/billing', target: process.env.BILLING_SERVICE_URL || 'http://localhost:3004' }, // Example
  { route: '/ai', target: process.env.AI_SERVICE_URL || 'http://localhost:8000' }, // Example (Python FastAPI often on 8000)
  // Add other services here
];

// Setup proxy middleware for each service
services.forEach(service => {
  app.use(service.route, createProxyMiddleware({ 
    target: service.target, 
    changeOrigin: true,
    pathRewrite: {
      [`^${service.route}`]: '', // remove base path
    },
    onError: (err, req, res) => {
      console.error(`Proxy error for ${service.route}:`, err);
      if (!res.headersSent) { // Check if headers already sent
        (res as Response).status(503).json({ message: `Service unavailable: ${service.route.substring(1)}` });
      } else {
        // If headers sent, it's harder to gracefully handle.
        // The connection might be abruptly closed by the client or an underlying error.
        // Log it and ensure the response stream is ended if possible.
        if (!(res as Response).writableEnded) {
            (res as Response).end();
        }
      }
    }
  }));
});


// Root route for the gateway
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Netram API Gateway is running!' });
});

// Basic Error Handling Middleware (should be last)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  if (!res.headersSent) {
    res.status(500).json({ message: 'Something broke on the gateway!', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
  console.log('Configured service routes:');
  services.forEach(s => console.log(`  ${s.route} -> ${s.target}`));
});
