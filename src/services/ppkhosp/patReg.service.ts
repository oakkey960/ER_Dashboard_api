import { Op } from "sequelize";
import { sequelize } from "../../models/ppkhosp";
import db from "../../models/ppkhosp";

export class PatRegService {
  static async getPatRegData(query: Record<string, any>) {
    const locationid = query.locationid || "3300";

    // Parse flag_status (handle array or comma-separated string)
    let flag_status = ["A", "B"];
    if (query.flag_status) {
      flag_status = Array.isArray(query.flag_status)
        ? query.flag_status
        : query.flag_status.split(",");
    }

    // Parse flag_reg (handle array or comma-separated string)
    let flag_reg = ["1", "A", "B", "P"];
    if (query.flag_reg) {
      flag_reg = Array.isArray(query.flag_reg)
        ? query.flag_reg
        : query.flag_reg.split(",");
    }

    // Parse pagination params
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 50;
    const offset = (page - 1) * limit;

    // Parse search keyword
    const search = query.search ? String(query.search).trim() : "";

    // Parse filterlevel (sort order: asc or desc)
    const filterlevel = query.filterlevel ? String(query.filterlevel).trim().toLowerCase() : null;
    let orderOption: any[] | undefined = undefined;
    if (filterlevel === "asc" || filterlevel === "desc") {
      const sortOrder = filterlevel === "desc" ? "DESC" : "ASC";
      orderOption = [
        [sequelize.literal("ISNULL(pat_urgent.startlevel)"), "ASC"],
        [{ model: db.PatUrgent, as: "pat_urgent" }, "startlevel", sortOrder],
      ];
    }

    // Parse visitdates if provided
    let visitdatesArray: string[] | null = null;
    if (query.visitdates) {
      if (Array.isArray(query.visitdates)) {
        visitdatesArray = query.visitdates.map((d: any) => String(d).trim());
      } else {
        visitdatesArray = String(query.visitdates)
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean);
      }
    }

    // Helper to format Date objects as local YYYY-MM-DD
    const getLocalDateString = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Determine the visitdate filter condition
    const filterTypeDate = query.filterTypeDate ? String(query.filterTypeDate).trim() : null;
    const filterTypeMonth = query.filterTypeMonth ? String(query.filterTypeMonth).trim() : null;
    let visitdateCondition: any;

    if (filterTypeDate === "all") {
      // Show all dates (omit visitdate constraint)
    } else if (filterTypeDate) {
      const daysCount = parseInt(filterTypeDate, 10);
      if (!isNaN(daysCount) && daysCount > 0) {
        // e.g. 1 means today (>= todayStr), 2 means today & yesterday (>= yesterdayStr)
        const startDateObj = new Date();
        startDateObj.setDate(startDateObj.getDate() - (daysCount - 1));
        const startDateStr = getLocalDateString(startDateObj);
        visitdateCondition = {
          [Op.gte]: startDateStr,
        };
      }
    } else if (filterTypeMonth) {
      const monthsCount = parseInt(filterTypeMonth, 10);
      if (!isNaN(monthsCount) && monthsCount > 0) {
        // e.g. 1 means back 1 month from today, starting from the 1st of that month (>= startDate)
        const startDateObj = new Date();
        startDateObj.setMonth(startDateObj.getMonth() - monthsCount);
        startDateObj.setDate(1); // Set to the 1st of that month
        const startDateStr = getLocalDateString(startDateObj);
        visitdateCondition = {
          [Op.gte]: startDateStr,
        };
      }
    } else if (visitdatesArray && visitdatesArray.length > 0) {
      visitdateCondition = {
        [Op.in]: visitdatesArray,
      };
    } else if (query.visitdate) {
      // If visitdate is explicitly provided in query (e.g. visitdate=2026-08-13)
      visitdateCondition = {
        [Op.gte]: String(query.visitdate).trim(),
      };
    } else {
      // Default: -7 days (today - 6 days)
      const defaultStartDateObj = new Date();
      defaultStartDateObj.setDate(defaultStartDateObj.getDate() - 6);
      const defaultStartDateStr = getLocalDateString(defaultStartDateObj);
      visitdateCondition = {
        [Op.gte]: defaultStartDateStr,
      };
    }

    // Build base where condition
    const whereCondition: any = {
      locationid,
      flag_status: {
        [Op.in]: flag_status,
      },
      flag_reg: {
        [Op.in]: flag_reg,
      },
    };

    if (visitdateCondition !== undefined) {
      whereCondition.visitdate = visitdateCondition;
    }

    if (search) {
      const escapedSearch = sequelize.escape(`%${search}%`);
      whereCondition[Op.and] = [
        sequelize.literal(
          `(PatReg.hn LIKE ${escapedSearch} OR (SELECT CONCAT(IFNULL(prename,''), IFNULL(firstName,''), ' ', IFNULL(lastName,'')) FROM pat WHERE hn = PatReg.hn) LIKE ${escapedSearch})`
        ),
      ];
    }

    // 1. Fetch total count and paginated rows using findAndCountAll
    const { count: total, rows: data } = await db.PatReg.findAndCountAll({
      attributes: [
        "id",
        "hn",
        [
          sequelize.literal(
            "(SELECT CONCAT(prename, firstName, '  ', lastName) FROM pat WHERE hn = PatReg.hn)",
          ),
          "pt_name",
        ],
        [
          sequelize.literal("(SELECT sex FROM pat WHERE hn = PatReg.hn)"),
          "gender",
        ],
        [
          sequelize.literal(
            "(SELECT ageday FROM pat_visit WHERE id = PatReg.patvisitid)",
          ),
          "ageday",
        ],
        "startdatetime",
        "regdatetime",
        "flag_reg",
        [
          sequelize.literal(
            "(SELECT descvalue FROM pat_flag WHERE tablename = 'pat_reg' AND columnname = 'flag_reg' AND columnvalue = PatReg.flag_reg)",
          ),
          "cstatsus",
        ],
        [sequelize.literal("pat_urgent.flag_status"), "flag_status"],
        [
          sequelize.literal(
            "(SELECT pat_flag.descvalue FROM pat_flag WHERE pat_flag.tablename = 'pat_urgent' AND pat_flag.columnname = 'flag_status' AND pat_flag.columnvalue = pat_urgent.flag_status)",
          ),
          "urg_status",
        ],
        [sequelize.literal("pat_urgent.startlevel"), "startlevel"],
        [sequelize.literal("pat_urgent.endlevel"), "endlevel"],
      ],
      where: whereCondition,
      include: [
        {
          model: db.PatUrgent,
          as: "pat_urgent",
          required: false, // LEFT JOIN
          attributes: [],
        },
      ],
      order: orderOption,
      limit,
      offset,
      raw: true,
    });

    // Format ageday to Year, Month, Day in each row
    const formattedData = data.map((row: any) => {
      const agedayVal = Number(row.ageday);
      let age_formatted = "-";

      if (
        row.ageday !== null &&
        row.ageday !== undefined &&
        !isNaN(agedayVal)
      ) {
        const years = Math.floor(agedayVal / 365);
        const remainingDays = agedayVal % 365;
        const months = Math.floor(remainingDays / 30);
        const days = remainingDays % 30;

        if (years >= 1) {
          age_formatted = `${years}ปี`;
        } else if (months > 0) {
          age_formatted = `${months}เดือน`;
        } else {
          age_formatted = `${days}วัน`;
        }
      }

      return {
        ...row,
        ageday_raw: row.ageday,
        ageday: age_formatted,
      };
    });

    // Count summary card metrics across all matching patients
    const allActivePat = await db.PatReg.findAll({
      attributes: [
        "id",
        "hn",
        [
          sequelize.literal(
            "(SELECT CONCAT(prename, firstName, '  ', lastName) FROM pat WHERE hn = PatReg.hn)"
          ),
          "pt_name",
        ],
        "startdatetime",
        "flag_reg",
      ],
      include: [
        {
          model: db.PatUrgent,
          as: "pat_urgent",
          required: false, // LEFT JOIN
          attributes: [
            [sequelize.literal("pat_urgent.startlevel"), "startlevel"],
          ],
        },
      ],
      where: whereCondition,
      raw: true,
    });

    const now = Date.now();
    let urgent90Count = 0;
    let waiting60Count = 0;
    let triageCount = 0;
    let examiningCount = 0;
    const urgent90List: any[] = [];

    // นับ triage level 1-5 และ ไม่ระบุ ระดับ
    let level1 = 0,
      level2 = 0,
      level3 = 0,
      level4 = 0,
      level5 = 0,
      levelNull = 0;

    allActivePat.forEach((row: any) => {
      if (row.startdatetime) {
        const start = new Date(row.startdatetime).getTime();
        if (!isNaN(start)) {
          const diffMins = (now - start) / 1000 / 60;
          if (diffMins > 90) {
            urgent90Count++;
            urgent90List.push({
              id: row.id,
              hn: row.hn,
              pt_name: row.pt_name,
              startdatetime: row.startdatetime,
              flag_reg: row.flag_reg,
              startlevel: row["pat_urgent.startlevel"],
              waiting_mins: Math.floor(diffMins),
            });
          }
          if (diffMins > 60) waiting60Count++;
        }
      }

      if (row.flag_reg === "1" || row.flag_reg === "A") {
        triageCount++;
      } else if (row.flag_reg === "B" || row.flag_reg === "P") {
        examiningCount++;
      }

      // นับ startlevel (ค่าอยู่ใน row["pat_urgent.startlevel"] เมื่อ raw: true + include)
      const lv = Number(row["pat_urgent.startlevel"]);
      if (lv === 1) level1++;
      else if (lv === 2) level2++;
      else if (lv === 3) level3++;
      else if (lv === 4) level4++;
      else if (lv === 5) level5++;
      else levelNull++;
    });

    return {
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        total,
        urgent90Count,
        waiting60Count,
        triageCount,
        examiningCount,
        triageLevels: [level1, level2, level3, level4, level5, levelNull],
      },
      urgent90List,
    };
  }
}
