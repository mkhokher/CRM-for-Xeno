// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import apiRouter from "./routes/api.js";

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5001;
// const FRONTEND = process.env.FRONTEND_URL || "http://localhost:5173";

// app.use(cors({ origin: FRONTEND, credentials: true }));
// app.use(express.json());

// console.log("Gemini key loaded?", process.env.GEMINI_API_KEY ? "yes" : "no");

// //DB
// mongoose.set("strictQuery", true);
// mongoose
//   .connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB connected"))
//   .catch((e) => console.error("MongoDB connection error:", e.message));

// //Routes
// app.use("/api", apiRouter);

// //Health
// app.get("/health", (_req, res) => res.json({ ok: true }));

// app.listen(PORT, () =>
//   console.log(`Server running on http://localhost:${PORT}`)
// );
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import apiRouter from "./routes/api.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const FRONTEND = process.env.FRONTEND_URL || "http://localhost:5173";

// Middleware
app.use(cors({ origin: FRONTEND, credentials: true }));
app.use(express.json());

// Session setup (required for passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET, // ⚠️ use env in production
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

console.log("Gemini key loaded?", process.env.GEMINI_API_KEY ? "yes" : "no");

// -----------------
// MongoDB Connection
// -----------------
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((e) => console.error("MongoDB connection error:", e.message));

// -----------------
// Passport Google OAuth
// -----------------
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5001/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // You can save user profile to DB here if needed
      return done(null, profile);
    }
  )
);

// -----------------
// Auth Routes
// -----------------
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect(FRONTEND); // successful login -> redirect frontend
  }
);

app.get("/auth/logout", (req, res) => {
  req.logout(() => {
    res.redirect(FRONTEND);
  });
});

app.get("/auth/user", (req, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// -----------------
// API Routes
// -----------------
app.use("/api", apiRouter);

// -----------------
// Health Check
// -----------------
app.get("/health", (_req, res) => res.json({ ok: true }));

// -----------------
// Server Start
// -----------------
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

