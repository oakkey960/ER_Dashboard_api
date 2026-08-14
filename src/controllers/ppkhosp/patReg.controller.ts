import { Request, Response } from "express";
import { PatRegService } from "../../services/ppkhosp/patReg.service";

export class PatRegController {
  static async getPatRegData(req: Request, res: Response) {
    try {
      const data = await PatRegService.getPatRegData(req.query);
      return res.status(200).json({
        success: true,
        ...data,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || "Internal Server Error",
      });
    }
  }
}
