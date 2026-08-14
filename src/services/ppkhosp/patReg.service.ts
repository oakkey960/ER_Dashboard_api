import { Op } from "sequelize";
import { sequelize } from "../../models/ppkhosp";
import db from "../../models/ppkhosp";

export class PatRegService {
  static async getPatRegData(query: Record<string, any>) {
    const locationid = query.locationid || "3300";
    const visitdate = query.visitdate || "2026-08-13";

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

    // 1. Fetch total count and paginated rows using findAndCountAll
    const { count: total, rows: data } = await db.PatReg.findAndCountAll({
      attributes: [
        "id",
        "hn",
        [
          sequelize.literal(
            "(SELECT CONCAT(prename, firstName, '  ', lastName) FROM pat WHERE hn = PatReg.hn)"
          ),
          "pt_name",
        ],
        [
          sequelize.literal(
            "(SELECT sex FROM pat WHERE hn = PatReg.hn)"
          ),
          "gender",
        ],
        [
          sequelize.literal(
            "(SELECT ageday FROM pat_visit WHERE id = PatReg.patvisitid)"
          ),
          "ageday",
        ],
        "startdatetime",
        "regdatetime",
        "flag_reg",
        [
          sequelize.literal(
            "(SELECT descvalue FROM pat_flag WHERE tablename = 'pat_reg' AND columnname = 'flag_reg' AND columnvalue = PatReg.flag_reg)"
          ),
          "cstatsus",
        ],
        [
          sequelize.literal("pat_urgent.flag_status"),
          "flag_status",
        ],
        [
          sequelize.literal(
            "(SELECT pat_flag.descvalue FROM pat_flag WHERE pat_flag.tablename = 'pat_urgent' AND pat_flag.columnname = 'flag_status' AND pat_flag.columnvalue = pat_urgent.flag_status)"
          ),
          "urg_status",
        ],
        [
          sequelize.literal("pat_urgent.startlevel"),
          "startlevel",
        ],
        [
          sequelize.literal("pat_urgent.endlevel"),
          "endlevel",
        ],
      ],
      where: {
        locationid,
        visitdate: {
          [Op.gte]: visitdate,
        },
        flag_status: {
          [Op.in]: flag_status,
        },
        flag_reg: {
          [Op.in]: flag_reg,
        },
      },
      include: [
        {
          model: db.PatUrgent,
          as: "pat_urgent",
          required: false, // LEFT JOIN
          attributes: [],
        },
      ],
      limit,
      offset,
      raw: true,
    });

    // Format ageday to Year, Month, Day in each row
    const formattedData = data.map((row: any) => {
      const agedayVal = Number(row.ageday);
      let age_formatted = "-";

      if (row.ageday !== null && row.ageday !== undefined && !isNaN(agedayVal)) {
        const years = Math.floor(agedayVal / 365);
        const remainingDays = agedayVal % 365;
        const months = Math.floor(remainingDays / 30);
        const days = remainingDays % 30;

        const parts = [];
        if (years > 0) parts.push(`${years} ปี`);
        if (months > 0 || years > 0) parts.push(`${months} เดือน`);
        parts.push(`${days} วัน`);
        age_formatted = parts.join(" ");
      }

      return {
        ...row,
        ageday_raw: row.ageday,
        ageday: age_formatted,
      };
    });

    return {
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
