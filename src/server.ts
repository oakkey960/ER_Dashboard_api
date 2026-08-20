import * as dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { PatRegService } from "./services/ppkhosp/patReg.service";

const parsedPort = Number(process.env.PORTAPP);
const PORT = !isNaN(parsedPort) && parsedPort > 0 ? parsedPort : 3003;
const HOST = "0.0.0.0";

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`[Socket.IO ER] Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`[Socket.IO ER] Client disconnected: ${socket.id}`);
  });
});

// Broadcast real-time data & summary directly inside Socket payload every 5 seconds (No HTTP fetch required by client)
setInterval(async () => {
  if (io.engine.clientsCount > 0) {
    try {
      const result = await PatRegService.getPatRegData({ page: 1, limit: 50 });
      io.emit("er_dashboard_update", {
        data: result.data,
        summary: result.summary,
        pagination: result.pagination,
      });
    } catch (err) {
      console.error("[Socket.IO Broadcast Error]:", err);
    }
  }
}, 5000);

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Server accessible at http://<YOUR_LOCAL_IP>:${PORT}`);
});
