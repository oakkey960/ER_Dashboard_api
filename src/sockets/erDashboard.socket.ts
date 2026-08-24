import { Server, Socket } from "socket.io";
import { authorizeSocketGroup } from "../middleware/auth.middleware";
import { PatRegService } from "../services/ppkhosp/patReg.service";

// ⚙️ Configuration สำหรับ Socket ของ ER Dashboard
// (ในอนาคตสามารถเพิ่ม/ลด groupid หรือเปลี่ยนปุ่ม/ค่าต่างๆ ใน object นี้ได้เลย)
export const ER_SOCKET_CONFIG = {
  // รายการ User Group / Reference ID ที่อนุญาตให้ใช้งาน Socket นี้
  allowedGroups: [3300],

  // ชื่อ Event สำหรับยิงข้อมูล Real-time ให้ Frontend
  eventName: "er_dashboard_update",

  // ระยะเวลาในการ Broadcast ข้อมูล Real-time (มิลลิวินาที)
  broadcastIntervalMs: 5000,

  // ค่า Filter เริ่มต้น
  defaultFilter: {
    page: 1,
    limit: 50,
    filterTypeDate: "1",
    filterlevel: "",
    locationid: "3300",
  },
};

// 📌 Helper สร้าง Key สำหรับแยก Room ตาม Filter ที่เหมือนกัน
function getFilterKey(filter: Record<string, any>): string {
  const cleanFilter: Record<string, any> = {
    page: filter.page || 1,
    limit: filter.limit || 50,
    filterTypeDate: filter.filterTypeDate ?? "1",
    filterlevel: filter.filterlevel ?? filter.filterlavel ?? "",
    filterTypeMonth: filter.filterTypeMonth ?? "",
    search: filter.search ?? "",
    visitdate: filter.visitdate ?? "",
    locationid: filter.locationid ?? ER_SOCKET_CONFIG.defaultFilter.locationid,
    urgentLimit: filter.urgentLimit ?? 120,
    warningLimit: filter.warningLimit ?? 90,
  };
  return JSON.stringify(cleanFilter);
}

// 📌 Helper อัปเดต Filter และจัดกลุ่ม Socket เข้า Room
function updateSocketFilterAndRoom(
  socket: Socket,
  newFilter: Record<string, any>,
) {
  socket.data.filter = { ...(socket.data.filter || {}), ...newFilter };

  const filterKey = getFilterKey(socket.data.filter);
  const newRoomName = `room:${filterKey}`;

  if (socket.data.roomName && socket.data.roomName !== newRoomName) {
    socket.leave(socket.data.roomName);
  }

  socket.data.roomName = newRoomName;
  socket.join(newRoomName);
  return newRoomName;
}

// 📌 Helper ดึงและส่งข้อมูลให้ Socket เดียว
async function sendDataToSocket(socket: Socket) {
  try {
    const filterParams = socket.data.filter || ER_SOCKET_CONFIG.defaultFilter;
    const result = await PatRegService.getPatRegData(filterParams);

    socket.emit(ER_SOCKET_CONFIG.eventName, {
      filter: filterParams,
      data: result.data,
      summary: result.summary,
      pagination: result.pagination,
      urgent90List: result.urgent90List,
    });
  } catch (err) {
    console.error(`[Socket Error ${socket.id}]:`, err);
  }
}

// 🚀 ฟังก์ชันหลักสำหรับตั้งค่า Socket.IO ของ ER Dashboard
export function setupErDashboardSocket(io: Server) {
  // 1. 🔒 ป้องกันด้วย Authorization Middleware (ใช้กลุ่มสิทธิ์จาก Config)
  io.use(authorizeSocketGroup(...ER_SOCKET_CONFIG.allowedGroups));

  // 2. ⚡ Event Handlers เมื่อมี Client เชื่อมต่อ
  io.on("connection", (socket: Socket) => {
    console.log(`[Socket.IO ER] Client connected: ${socket.id}`);

    // ตั้งค่า Filter เริ่มต้นและเข้า Room
    updateSocketFilterAndRoom(socket, ER_SOCKET_CONFIG.defaultFilter);

    // ส่งข้อมูลให้ทันทีเมื่อเชื่อมต่อ
    sendDataToSocket(socket);

    // รับ event เปลี่ยน filter จาก Frontend
    socket.on("set_filter", async (newFilter: Record<string, any>) => {
      updateSocketFilterAndRoom(socket, newFilter);
      console.log(
        `[Socket.IO ER] Client ${socket.id} joined ${socket.data.roomName}`,
      );
      await sendDataToSocket(socket);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO ER] Client disconnected: ${socket.id}`);
    });
  });

  // 3. ⚡ Dynamic Room Broadcast (คิวรี DB เท่าจำนวนประเภท Filter ที่เปิดอยู่เท่านั้น!)
  setInterval(async () => {
    if (io.engine.clientsCount > 0) {
      try {
        const sockets = await io.fetchSockets();
        const activeRooms = new Map<string, Record<string, any>>();

        for (const socket of sockets) {
          if (socket.data.roomName && socket.data.filter) {
            activeRooms.set(socket.data.roomName, socket.data.filter);
          }
        }

        for (const [roomName, filterParams] of activeRooms.entries()) {
          try {
            const result = await PatRegService.getPatRegData(filterParams);
            io.to(roomName).emit(ER_SOCKET_CONFIG.eventName, {
              filter: filterParams,
              data: result.data,
              summary: result.summary,
              pagination: result.pagination,
              urgent90List: result.urgent90List,
            });
          } catch (err) {
            console.error(`[Socket Room Error ${roomName}]:`, err);
          }
        }
      } catch (err) {
        console.error("[Socket.IO Broadcast Error]:", err);
      }
    }
  }, ER_SOCKET_CONFIG.broadcastIntervalMs);
}
