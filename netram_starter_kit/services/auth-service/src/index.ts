
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
// import admin from 'firebase-admin'; // Uncomment if using Firebase Admin SDK

dotenv.config();

// Uncomment and configure if using Firebase Admin SDK
/*
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully for Auth Service.');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK for Auth Service:', error);
  }
} else {
  console.warn('GOOGLE_APPLICATION_CREDENTIALS not set for Auth Service. Firebase Admin features will be unavailable.');
}
*/

const app = express();
const PORT = process.env.PORT_AUTH_SERVICE || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Example Routes (replace with actual authentication logic)
app.post('/register', (req: Request, res: Response) => {
  // TODO: Implement user registration logic (e.g., with Firebase Auth or custom DB)
  const { email, password, name, role } = req.body;
  console.log('Registering user:', { email, name, role });
  // Example: Create user in Firebase Auth or your DB, then generate JWT
  res.status(201).json({ message: 'User registration placeholder', userId: 'new-user-id', token: 'example-jwt' });
});

app.post('/login', (req: Request, res: Response) => {
  // TODO: Implement user login logic
  const { email, password } = req.body;
  console.log('Logging in user:', { email });
  // Example: Authenticate user, then generate JWT
  res.status(200).json({ message: 'User login placeholder', userId: 'logged-in-user-id', token: 'example-jwt' });
});

app.post('/refresh-token', (req: Request, res: Response) => {
  // TODO: Implement refresh token logic
  const { refreshToken } = req.body;
  console.log('Refreshing token');
  res.status(200).json({ message: 'Token refresh placeholder', accessToken: 'new-access-token' });
});

app.post('/logout', (req: Request, res: Response) => {
  // TODO: Implement logout logic (e.g., invalidate refresh token)
  console.log('Logging out user');
  res.status(200).json({ message: 'User logout placeholder' });
});

// Middleware to verify JWT (example)
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401); // if there isn't any token

  // jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
  //   if (err) return res.sendStatus(403);
  //   (req as any).user = user;
  //   next();
  // });
  console.log('Token authentication placeholder for:', token);
  next(); // Placeholder
};

app.get('/me', authenticateToken, (req: Request, res: Response) => {
  // TODO: Return current user's profile
  res.json({ message: 'Current user profile placeholder', user: (req as any).user });
});


// Root route for the service
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Vision Care Plus Auth Service is running!' });
});

// Basic Error Handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke in Auth Service!', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Auth Service listening on port ${PORT}`);
});

