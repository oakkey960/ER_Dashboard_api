import { Request, Response, NextFunction } from "express";
import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import dbppk from "../models/ppkhosp";

export interface AuthenticatedRequest extends Request {
  user?: {
    id?: number;
    userid: number;
    username: string;
    role_id?: number;
    doctorid?: number | null;
    funcUnitID?: number | null;
    type_id?: number | null;
    data_group?: number[];
    userGroup?: number | number[];
    groupid?: number | number[];
    [key: string]: any;
  };
}

// 📌 1. Helper ดึงข้อมูลสิทธิ์ (groupid + referenceid) จาก DB แบบ Real-time
export const getUserPermissionsFromDB = async (userid: number) => {
  const [userGroups, userDatasetUsers] = await Promise.all([
    dbppk.AppUserGroup.findAll({
      where: { userid, active: "Y" },
      attributes: ["groupid", "userid"],
      include: [
        {
          model: dbppk.AppDatasetGroup,
          as: "DataSetGroups",
          attributes: ["groupid", "referenceid"],
        },
      ],
    }),
    dbppk.AppDatasetUser.findAll({
      where: { userid },
      attributes: ["userid", "referenceid"],
    }),
  ]);

  const groupIds = userGroups.map((g: any) => Number(g.groupid));
  const dataGroups: number[] = [];

  // 1. ดึง referenceid จาก DataSetGroups (สิทธิ์กลุ่ม)
  userGroups.forEach((g: any) => {
    if (g.DataSetGroups && Array.isArray(g.DataSetGroups)) {
      g.DataSetGroups.forEach((ds: any) => {
        const refId = Number(ds.referenceid);
        if (!isNaN(refId) && !dataGroups.includes(refId)) {
          dataGroups.push(refId);
        }
      });
    }
  });

  // 2. ดึง referenceid จาก userDatasetUsers (สิทธิ์รายบุคคล)
  userDatasetUsers.forEach((u: any) => {
    const refId = Number(u.referenceid);
    if (!isNaN(refId) && !dataGroups.includes(refId)) {
      dataGroups.push(refId);
    }
  });

  return { groupIds, dataGroups };
};

// 📌 2. Helper สกัดดึง JWT Token จาก Express Request หรือ Socket.IO Handshake
export const extractToken = (reqOrSocket: any): string | null => {
  // 1) กรณีเป็น Express HTTP Request
  if (reqOrSocket?.cookies?.access_token) {
    return reqOrSocket.cookies.access_token;
  }
  if (reqOrSocket?.headers?.authorization?.startsWith("Bearer ")) {
    return reqOrSocket.headers.authorization.split(" ")[1];
  }

  // 2) กรณีเป็น Socket.IO Handshake
  const cookieHeader = reqOrSocket?.handshake?.headers?.cookie;
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c: string) => {
        const [k, ...v] = c.split("=");
        return [k, v.join("=")];
      }),
    );
    if (cookies.access_token) return cookies.access_token;
  }

  const socketAuthHeader = reqOrSocket?.handshake?.headers?.authorization;
  if (socketAuthHeader?.startsWith("Bearer ")) {
    return socketAuthHeader.split(" ")[1];
  }
  if (reqOrSocket?.handshake?.auth?.token) {
    return reqOrSocket.handshake.auth.token;
  }

  return null;
};

// -------------------------------------------------------------
// 🔒 Express HTTP Middlewares
// -------------------------------------------------------------

// ยืนยันตัวตน Token สำหรับ HTTP Route
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({
        status: 401,
        success: false,
        data: null,
        message: "Access Denied: ไม่พบ Token ใน Cookie หรือ Header",
      });
    }

    const secretKey: jwt.Secret = process.env.JWT_SECRET || "secretkey";
    const decoded: any = jwt.verify(token, secretKey);

    if (decoded && decoded.userid) {
      const { groupIds, dataGroups } = await getUserPermissionsFromDB(
        decoded.userid,
      );
      decoded.userGroup = groupIds;
      decoded.groupid = groupIds;
      decoded.data_group = dataGroups;
    }

    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error: any) {
    return res.status(401).json({
      status: 401,
      success: false,
      data: null,
      message: error.message || "Token ไม่ถูกต้องหรือหมดอายุแล้ว",
    });
  }
};

// ตรวจสอบ Role ของผู้ใช้ (เช่น role_id 1, 2)
export const authorizeRole = (...allowedRoles: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user || (user.role_id && !allowedRoles.includes(user.role_id))) {
      return res.status(403).json({
        status: 403,
        success: false,
        data: null,
        message: "Forbidden: คุณไม่มีสิทธิ์เข้าถึงข้อมูลส่วนนี้",
      });
    }
    next();
  };
};

// ตรวจสอบ UserGroup / ReferenceID สำหรับ HTTP Route (เช่น 3300)
export const authorizeUserGroup = (...allowedGroups: (number | string)[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      return res.status(401).json({
        status: 401,
        success: false,
        data: null,
        message: "Unauthorized: ไม่พบข้อมูลผู้ใช้งาน",
      });
    }

    const allUserGroups = [
      ...(Array.isArray(user.data_group) ? user.data_group : []),
      ...(Array.isArray(user.userGroup) ? user.userGroup : []),
      ...(Array.isArray(user.groupid) ? user.groupid : []),
    ];

    const numericAllowed = allowedGroups.map((g) => Number(g));
    const hasAccess = allUserGroups.some((g: any) =>
      numericAllowed.includes(Number(g)),
    );

    if (!hasAccess) {
      return res.status(403).json({
        status: 403,
        success: false,
        data: null,
        message:
          "Forbidden: คุณไม่มีสิทธิ์เข้าถึงข้อมูล (User Group / Reference ID ไม่ถูกต้อง)",
      });
    }

    next();
  };
};

// -------------------------------------------------------------
// 🔒 Socket.IO Middleware (เรียกร้องใช้ง่ายใน server.ts)
// -------------------------------------------------------------
export const authorizeSocketGroup = (...allowedGroups: (number | string)[]) => {
  return async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const token = extractToken(socket);
      if (!token) {
        return next(
          new Error("Unauthorized: ไม่พบ Token ในการเชื่อมต่อ Socket"),
        );
      }

      const secretKey: jwt.Secret = process.env.JWT_SECRET || "secretkey";
      const decoded: any = jwt.verify(token, secretKey);

      if (!decoded || !decoded.userid) {
        return next(new Error("Unauthorized: Token ไม่ถูกต้อง"));
      }

      const { groupIds, dataGroups } = await getUserPermissionsFromDB(
        decoded.userid,
      );
      decoded.userGroup = groupIds;
      decoded.groupid = groupIds;
      decoded.data_group = dataGroups;

      const allPermissions = [...dataGroups, ...groupIds];
      const numericAllowed = allowedGroups.map((g) => Number(g));

      const hasAccess = allPermissions.some((id) =>
        numericAllowed.includes(id),
      );

      if (!hasAccess) {
        return next(
          new Error(
            `Forbidden: คุณไม่มีสิทธิ์เข้าถึง Socket ข้อมูลกลุ่ม (${allowedGroups.join(
              ", ",
            )})`,
          ),
        );
      }

      socket.data.user = decoded;
      next();
    } catch (err: any) {
      return next(
        new Error(
          `Unauthorized: ${err.message || "Token ไม่ถูกต้องหรือหมดอายุ"}`,
        ),
      );
    }
  };
};
