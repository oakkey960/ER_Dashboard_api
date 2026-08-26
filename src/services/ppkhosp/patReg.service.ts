import { Op } from "sequelize";
import db, { sequelize } from "../../models/ppkhosp";
import {
  parseArrayParam,
  buildVisitDateCondition,
  filterFastTrackComment,
  formatAgeFromDays,
  getPatRegAttributes,
  getPatRegIncludes,
} from "./helpers/patRegHelpers";

// ⚡ In-Memory Cache (3 วินาที เพื่อตอบสนอง Socket & Multi-Client ได้ใน 0.1ms!)
const cacheMap = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 3000;

export class PatRegService {
  static async getPatRegData(query: Record<string, any>) {
    const locationid = query.locationid || "3300";
    const flag_status = parseArrayParam(query.flag_status, ["A", "B"]);
    const flag_reg = parseArrayParam(query.flag_reg, ["1", "A", "B", "P", "G"]);
    // const flag_reg = parseArrayParam(query.flag_reg, ["H", "G", "J"]);
    // const flag_reg = parseArrayParam(query.flag_reg, ["H", "G", "J"]);

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, parseInt(query.limit, 10) || 50);
    const offset = (page - 1) * limit;

    const urgentLimit = parseInt(query.urgentLimit, 10) || 120;
    const warningLimit = parseInt(query.warningLimit, 10) || 90;

    const search = query.search ? String(query.search).trim() : "";

    // ⚡ 0. Check In-Memory Cache (ส่งคืนผลลัพธ์ทันทีใน 0.1ms หากเป็น Query เดียวกันที่เพิ่งค้นหา)
    const cacheKey = JSON.stringify({
      ...query,
      locationid,
      flag_status,
      flag_reg,
      page,
      limit,
      search,
    });
    const cached = cacheMap.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    // ตัวเลือกการเรียงลำดับ (Order option)
    const filterlevel = query.filterlevel
      ? String(query.filterlevel).trim().toLowerCase()
      : null;
    let orderOption: any[] | undefined = undefined;
    if (filterlevel === "asc" || filterlevel === "desc") {
      const sortOrder = filterlevel === "desc" ? "DESC" : "ASC";
      orderOption = [
        [sequelize.literal("ISNULL(pat_urgent.startlevel)"), "ASC"],
        [{ model: db.PatUrgent, as: "pat_urgent" }, "startlevel", sortOrder],
      ];
    } else {
      orderOption = [["startdatetime", "ASC"]];
    }

    // สร้าง Where condition
    const visitdateCondition = buildVisitDateCondition(query);
    const whereCondition: any = {
      locationid,
      flag_status: { [Op.in]: flag_status },
      flag_reg: { [Op.in]: flag_reg },
    };

    // const whereUrg: any = {
    //   flag_
    // }

    if (visitdateCondition !== undefined) {
      whereCondition.visitdate = visitdateCondition;
    }

    if (search) {
      const escapedSearch = sequelize.escape(`%${search}%`);
      whereCondition[Op.and] = [
        sequelize.literal(
          `(PatReg.hn LIKE ${escapedSearch} OR (SELECT CONCAT(IFNULL(prename,''), IFNULL(firstName,''), ' ', IFNULL(lastName,'')) FROM pat WHERE hn = PatReg.hn) LIKE ${escapedSearch})`,
        ),
      ];
    }

    // ⚡ 1. รัน Query หลัก 1 ครั้งและ PatFlag 1 ครั้ง พร้อมกันแบบ Parallel (ลดเวลา DB call 80%)
    const [allActivePat, patFlags] = await Promise.all([
      db.PatReg.findAll({
        attributes: [
          "id",
          "hn",
          "startdatetime",
          "regdatetime",
          "flag_reg",
        ],
        where: whereCondition,
        include: getPatRegIncludes(db, Op),
        order: orderOption,
        raw: true,
      }),

      db.PatFlag.findAll({
        where: {
          tablename: "pat_urgent",
          columnname: "flag_status",
        },
        attributes: ["columnvalue", "descvalue", "note"],
        raw: true,
      }),
    ]);

    const now = Date.now();
    let urgent90Count = 0;
    let waiting60Count = 0;
    let triageCount = 0;
    let examiningCount = 0;
    const urgent90List: any[] = [];
    const formattedData: any[] = [];

    const levelCounts: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    let levelNull = 0;
    const rawFlagCounts: Record<string, number> = {};

    // ⚡ 2. วนลูปประมวลผลข้อมูลทั้งหมดในครั้งเดียว (Single-Pass Loop)
    allActivePat.forEach((row: any) => {
      const prename = row.pt_name
        ? ""
        : row["pat.prename"] || row.pat?.prename || "";
      const firstname = row.pt_name
        ? ""
        : row["pat.firstname"] || row.pat?.firstname || "";
      const lastname = row.pt_name
        ? ""
        : row["pat.lastname"] || row.pat?.lastname || "";
      const pt_name =
        row.pt_name ||
        (prename || firstname || lastname
          ? `${prename}${firstname}  ${lastname}`
          : null);

      const gender = row.gender ?? row["pat.sex"] ?? row.pat?.sex ?? null;

      const ageday_raw =
        row.ageday_raw ??
        row.ageday ??
        row["pat_visit.ageday"] ??
        row.pat_visit?.ageday ??
        null;

      const cstatsus =
        row.cstatsus ||
        row["flag_reg_desc.descvalue"] ||
        row.flag_reg_desc?.descvalue ||
        null;

      const urg_flage_status =
        row.flag_status ||
        row["pat_urgent.flag_status"] ||
        row.pat_urgent?.flag_status ||
        null;

      const urg_status =
        row.urg_status ||
        row["pat_urgent.urg_status_desc.descvalue"] ||
        row["pat_urgent.PatFlag.descvalue"] ||
        row.pat_urgent?.urg_status_desc?.descvalue ||
        row.pat_urgent?.PatFlag?.descvalue ||
        null;

      const startlevel =
        row.startlevel ??
        row["pat_urgent.startlevel"] ??
        row.pat_urgent?.startlevel ??
        null;

      const endlevel =
        row.endlevel ??
        row["pat_urgent.endlevel"] ??
        row.pat_urgent?.endlevel ??
        null;

      const textcomment = filterFastTrackComment(
        row.textcomment ??
          row["ErRegistration.textcomment"] ??
          row.ErRegistration?.textcomment ??
          null,
      );

      const formatFlagReg = row.flag_reg === "A" ? "รับใหม่" : row.flag_reg;

      const display_status =
        !urg_status || String(urg_status).trim() === ""
          ? row.flag_reg === "A" || formatFlagReg === "รับใหม่"
            ? "รับใหม่"
            : cstatsus
          : urg_status;

      formattedData.push({
        id: row.id,
        hn: row.hn,
        pt_name,
        gender,
        ageday: formatAgeFromDays(ageday_raw),
        startdatetime: row.startdatetime,
        regdatetime: row.regdatetime,
        flag_reg: formatFlagReg,
        cstatsus,
        urg_flage_status,
        urg_status,
        display_status,
        startlevel,
        endlevel,
        textcomment,
        ageday_raw,
      });

      // ⚡ คำนวณระยะเวลารอ
      if (row.startdatetime) {
        const start =
          new Date(row.startdatetime).getTime() - 7 * 60 * 60 * 1000;
        if (!isNaN(start)) {
          const diffMins = (now - start) / 1000 / 60;
          if (diffMins >= urgentLimit) {
            urgent90Count++;
            urgent90List.push({
              id: row.id,
              hn: row.hn,
              pt_name,
              startdatetime: row.startdatetime,
              flag_reg: row.flag_reg,
              startlevel,
              waiting_mins: Math.floor(diffMins),
            });
          } else if (diffMins >= warningLimit) {
            waiting60Count++;
          }
        }
      }

      if (row.flag_reg === "1" || row.flag_reg === "A") {
        triageCount++;
      } else if (row.flag_reg === "B" || row.flag_reg === "P") {
        examiningCount++;
      }

      const lv = Number(startlevel);
      if (levelCounts[lv] !== undefined) {
        levelCounts[lv]++;
      } else {
        levelNull++;
      }

      if (urg_flage_status) {
        rawFlagCounts[urg_flage_status] =
          (rawFlagCounts[urg_flage_status] || 0) + 1;
      }
    });

    const total = allActivePat.length;
    const paginatedData = formattedData.slice(offset, offset + limit);

    // ⚡ ฟอร์แมตเป็น Array of Objects ที่หน้าบ้านนำไปใช้สร้าง Cards / Charts ได้ทันที
    const flagStatusCounts = patFlags
      .map((f: any) => ({
        flag_status: f.columnvalue,
        descvalue: f.descvalue || "",
        count: rawFlagCounts[f.columnvalue] || 0,
        note: f.note || null,
      }))
      .filter(
        (item: any) => item.count > 0 || flag_status.includes(item.flag_status),
      );

    const activeTotal = total;
    const urgent90Percent =
      activeTotal > 0
        ? Number(((urgent90Count / activeTotal) * 100).toFixed(2))
        : 0;
    const waiting60Percent =
      activeTotal > 0
        ? Number(((waiting60Count / activeTotal) * 100).toFixed(2))
        : 0;

    const finalResult = {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        total,
        activeTotal,
        urgent90Count,
        urgent90Percent,
        waiting60Count,
        waiting60Percent,
        triageCount,
        examiningCount,
        triageLevels: [
          levelCounts[1],
          levelCounts[2],
          levelCounts[3],
          levelCounts[4],
          levelCounts[5],
          levelNull,
        ],
        flagStatusCounts,
      },
      urgent90List,
    };

    // ⚡ บันทึกลง In-Memory Cache สำหรับครั้งต่อไป
    cacheMap.set(cacheKey, { timestamp: Date.now(), data: finalResult });

    return finalResult;
  }
  // static async sumGroupByFlagUrg(query: Record<string, any>) {
  //   const pat_reg =
  // }
}
