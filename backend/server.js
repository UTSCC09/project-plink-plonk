import express from 'express';
import path from 'path';
import { dirname } from "path";
import cors from 'cors';
import userRoutes from './routes/user.js';
import recordRoutes from './routes/record.js';
import lobbyRoutes from './routes/lobby.js';
import googleRoutes from './routes/google.js';
import session from "express-session";
import { parse, serialize } from "cookie";
import passport from 'passport';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();

// Serve static files from React app (to fix later)
app.use(express.static(path.join(__dirname, '../dist')));

const allowedOrigins = [process.env.FRONTEND, process.env.FRONTEND2, process.env.PROD, process.env.PROD2];

app.use(express.json());
app.use(cors({
  origin: allowedOrigins, // Set this to the exact origin of your frontend
  credentials: true // Allow credentials like cookies to be sent
}));

app.use(
  session({
    secret: "q9j3k8h2j1f9d0s3f9j2k3j1f09d2j3",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 1000 * 60 * 60 * 24, // session expiration (1 day in this case)
    },
  }),
);

app.use(function (req, res, next) {
  const cookies = parse(req.headers.cookie || "");
  req.username = req.session.username ? req.session.username : null;
  console.log(
    "HTTP request",
    req.session.username,
    req.method,
    req.url,
    req.body
  );
  next();
});

app.use(passport.initialize());
app.use(passport.session());

// Route handling
app.use("/api/records", recordRoutes);
app.use("/api/lobby", lobbyRoutes);
app.use('/api/google/', googleRoutes); // for OAuth login
app.use("/api/", userRoutes); // for regular login and signup


// API route ex.
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

// Catch-all route to serve React's index.html for all non-API routes .. apparently. fix later
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../dist', 'index.html'));
// });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // this should be printed in termina fs
});
