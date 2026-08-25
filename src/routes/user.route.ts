import { Router } from "express";
import { AllInOneController } from "../controllers/all_in_one/allInOne.controller";
import { PatRegController } from "../controllers/ppkhosp/patReg.controller";
import {
  authenticateToken,
  authorizeRole,
  authorizeUserGroup,
} from "../middleware/auth.middleware";

const router = Router();

// 🔒 ป้องกัน Route ทั้งหมดด้วย Middleware ยืนยันตัวตน พร้อมดึง req.user.data_group ล่าสุด
router.use(
  authenticateToken,
  authorizeRole(1, 2),
  authorizeUserGroup(3300, 3000)
);

router.get("/all-in-one", AllInOneController.index);
router.get("/pat-reg", PatRegController.getPatRegData);

export default router;
