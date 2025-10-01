import express from "express";
import cors from "cors";
import helmet from "helmet";
import { apiLimiter } from "./src/middlewares/ratelimit.middleware.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { logger } from "./src/utils/logger.js";
import { errorMiddleware } from "./src/middlewares/error.middleware.js";
import { pool } from "./config/db.js";
import { ENV } from "./config/env.js";
import hpp from "hpp";
import { sanitizeMiddleware } from "./src/middlewares/sanitize.middleware.js";

import authRouter from "./src/modules/auth/auth.route.js";
import teamRouter from "./src/modules/teams/teams.route.js";
import userRouter from "./src/modules/users/users.route.js";
// import tasksRouter from "./src/modules/tasks/tasks.route.js";
import invitationRouter from "./src/modules/invitations/invitations.route.js";
// import channelRouter from "./src/modules/channels/channel.route.js";
// import meetingRouter from "./src/modules/meetings/meeting.route.js";

const app = express();

// Middleware bawaan
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Logging
app.use(
  morgan("tiny", {
    stream: { write: (msg) => logger.http(msg.trim()) },
  })
);

// Security
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'", "https://apis.google.com"],
      },
    },
  })
);

// CORS
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(hpp());

app.use(sanitizeMiddleware);

// // Router
app.use("/api/v1/auth", authRouter); // auth route
app.use("/api/v1/user", userRouter); // user route
app.use("/api/v1/team", teamRouter); // team route
// app.use("/api/v1/task", tasksRouter); // tasks route
app.use("/api/v1/invitation", invitationRouter); // invitation route
// app.use("/api/v1/channel", channelRouter); // channel route
// app.use("/api/v1/meeting", meetingRouter); // meetings route

// Rate limiting
app.use(apiLimiter);

// Routes example
app.get("/", (req, res) => {
  logger.info("Root endpoint accessed");
  res.status(200).json({ connect: "connect success" });
});

// Middleware Error
app.use(errorMiddleware);

// Start Server

app.listen(ENV.PORT, async () => {
  try {
    await pool.query("SELECT 1");
    logger.info("Database connected");
    logger.info(`Server running at http://localhost:${ENV.PORT}`);
  } catch (err) {
    logger.error("Database connection failed", err);
    process.exit(1);
  }
});

export default app;
