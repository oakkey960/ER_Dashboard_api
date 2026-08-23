import { Server } from "socket.io";
import { setupErDashboardSocket } from "./erDashboard.socket";

// 📋 รายการฟังก์ชัน Setup ของ Socket ทั้งหมดในระบบ
// (ในอนาคตถ้ามี Dashboard หรือ Feature อื่นเพิ่ม แค่นำฟังก์ชัน setup มาต่อใน Array นี้ได้เลย)
const socketServices = [
  setupErDashboardSocket,
  // setupOpdDashboardSocket, // ตัวอย่างเมื่อมีระบบใหม่ในอนาคต
  // setupIpdDashboardSocket,
];

// 🚀 ฟังก์ชันสั่ง Map วน Loop เปิดใช้งาน Socket ทั้งหมดอัตโนมัติ
export function registerAllSockets(io: Server) {
  socketServices.forEach((setupSocket) => {
    setupSocket(io);
  });
}
