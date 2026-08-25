# ==========================================
# Stage 1: Build stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# คัดลอก package.json และ package-lock.json
COPY package*.json tsconfig.json ./

# ติดตั้ง dependencies ทั้งหมดสำหรับ build
RUN npm ci

# คัดลอก source code
COPY src ./src

# คอมไพล์ TypeScript เป็น JavaScript (ผลลัพธ์อยู่ที่ dist/)
RUN npm run build

# ลบ devDependencies ออกเพื่อลดขนาด node_modules
RUN npm prune --production

# ==========================================
# Stage 2: Production runner stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# คัดลอกเฉพาะ package.json, node_modules (production) และ dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# เปิด Port (ค่าเริ่มต้น 4016 ตามที่ตั้งใน server.ts/env)
EXPOSE 4016

# คำสั่งสำหรับเริ่มรัน Application
CMD ["node", "dist/server.js"]
