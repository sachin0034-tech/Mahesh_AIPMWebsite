import 'dotenv/config';
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { registerRoutes } from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — allow local dev client and production
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://maheshaicommunity.netlify.app',
    'https://myaicommunity.org',
    'https://www.myaicommunity.org',
  ],
  credentials: true,
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
registerRoutes(app);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
