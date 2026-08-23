// app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import userRoutes from "./routes/user.route";
import adminRoutes from "./routes/admin.route";
import authRoutes from "./routes/auth.route";
import publicRoutes from "./routes/public.route";

const app = express();
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    // origin: [
    //   "http://localhost:3000",
    //   "http://127.0.0.1:3000",
    //   "http://172.16.46.36:3000",
    //   process.env.FRONT_URL,
    // ].filter(Boolean) as string[],
    origin: true,
    credentials: true,
  }),
);

app.use("/api", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes);

export default app;
