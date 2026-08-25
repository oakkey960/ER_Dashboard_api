import { Op } from "sequelize";

// 🔹 รายการคำนำหน้าที่อนุญาตให้เป็น Fast Track (สามารถเพิ่ม/แก้ไข Prefix ได้ง่ายที่นี่)
export const FAST_TRACK_PREFIXES = ["Fast Track -"];

/**
 * Helper ตรวจสอบและคืนค่าเฉพาะ textcomment ที่ขึ้นต้นด้วย Fast Track เท่านั้น (ข้อความอื่นจะถูกแปลงเป็น null)
 */
export const filterFastTrackComment = (comment: any): string | null => {
  if (!comment || typeof comment !== "string") return null;
  const trimmed = comment.trim();
  const isFastTrack = FAST_TRACK_PREFIXES.some((prefix) =>
    trimmed.startsWith(prefix),
  );
  return isFastTrack ? trimmed : null;
};

/**
 * Helper แปลงวันที่เป็น String สากล YYYY-MM-DD
 */
export const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Helper แปลงจำนวนวัน (ageday) เป็นข้อความแสดงผลอายุภาษาไทย (เช่น "25 ปี", "5 เดือน", "10 วัน")
 */
export const formatAgeFromDays = (ageday: any): string => {
  const agedayVal = Number(ageday);
  if (ageday === null || ageday === undefined || isNaN(agedayVal)) return "-";

  const years = Math.floor(agedayVal / 365);
  const remainingDays = agedayVal % 365;
  const months = Math.floor(remainingDays / 30);
  const days = remainingDays % 30;

  if (years >= 1) return `${years} ปี`;
  if (months > 0) return `${months} เดือน`;
  return `${days} วัน`;
};

/**
 * Helper สกัดแปลงค่า Query String/Array ให้เป็น Array เสมอ
 */
export const parseArrayParam = (
  param: any,
  defaultValue: string[],
): string[] => {
  if (!param) return defaultValue;
  if (Array.isArray(param)) return param.map(String);
  return String(param)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

/**
 * Helper สร้างเงื่อนไขการค้นหาตามช่วงวันที่ (visitdate)
 */
export const buildVisitDateCondition = (query: Record<string, any>): any => {
  const filterTypeDate = query.filterTypeDate
    ? String(query.filterTypeDate).trim()
    : null;
  const filterTypeMonth = query.filterTypeMonth
    ? String(query.filterTypeMonth).trim()
    : null;

  if (filterTypeDate === "all") {
    return undefined;
  }

  if (filterTypeDate) {
    const daysCount = parseInt(filterTypeDate, 10);
    if (!isNaN(daysCount) && daysCount > 0) {
      const startDateObj = new Date();
      startDateObj.setDate(startDateObj.getDate() - (daysCount - 1));
      return { [Op.gte]: getLocalDateString(startDateObj) };
    }
  }

  if (filterTypeMonth) {
    const monthsCount = parseInt(filterTypeMonth, 10);
    if (!isNaN(monthsCount) && monthsCount > 0) {
      const startDateObj = new Date();
      startDateObj.setMonth(startDateObj.getMonth() - monthsCount);
      startDateObj.setDate(1);
      return { [Op.gte]: getLocalDateString(startDateObj) };
    }
  }

  let visitdatesArray: string[] = [];
  if (query.visitdates) {
    visitdatesArray = parseArrayParam(query.visitdates, []);
  }

  if (visitdatesArray.length > 0) {
    return { [Op.in]: visitdatesArray };
  }

  if (query.visitdate) {
    return { [Op.gte]: String(query.visitdate).trim() };
  }

  // Default: ย้อนหลัง 7 วัน (วันปัจจุบัน - 6 วัน)
  const defaultStartDateObj = new Date();
  defaultStartDateObj.setDate(defaultStartDateObj.getDate() - 6);
  return { [Op.gte]: getLocalDateString(defaultStartDateObj) };
};

/**
 * Helper สร้างรายการ Attributes สำหรับ SELECT ข้อมูลตาราง PatReg
 */
export const getPatRegAttributes = (sequelize: any) => [
  "id",
  "hn",
  "startdatetime",
  "regdatetime",
  "flag_reg",
];

/**
 * Helper สร้างรายการ Include Models สำหรับตาราง PatReg
 */
export const getPatRegIncludes = (db: any, Op: any) => [
  {
    model: db.Pat,
    as: "pat",
    required: false,
    attributes: ["sex", "prename", "firstname", "lastname"],
  },
  {
    model: db.PatVisit,
    as: "pat_visit",
    required: false,
    attributes: ["ageday"],
  },
  {
    model: db.PatUrgent,
    as: "pat_urgent",
    required: true, // 🔹 เป็น INNER JOIN เพื่อคัดแถวที่ไม่ตรงออกจริง
    attributes: ["flag_status", "startlevel", "endlevel"],
    where: {
      flag_status: { [Op.or]: [{ [Op.ne]: "X" }, null] },
      flag_cancel: { [Op.or]: [{ [Op.ne]: "Y" }, null] },
      flag_show: "Y",
    },
    include: [
      {
        model: db.PatFlag,
        as: "urg_status_desc",
        required: false,
        attributes: ["descvalue"],
      },
    ],
  },
  {
    model: db.ErRegistration,
    as: "ErRegistration",
    required: false,
    attributes: ["textcomment"],
  },
  {
    model: db.PatFlag,
    as: "flag_reg_desc",
    required: false,
    attributes: ["descvalue"],
  },
];
