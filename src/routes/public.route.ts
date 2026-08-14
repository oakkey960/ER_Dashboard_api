import express from "express";
import { PatRegController } from "../controllers/ppkhosp/patReg.controller";
const router = express.Router();
// const apiLogger = require("../middleware/apiLogger");
// const {
//   authenticateToken,
//   authorizeRole,
// } = require("../middleware/authMiddleware");

//route
// router.use(authenticateToken, apiLogger, authorizeRole(1));

// router.get("/mapAll", AllChoiceController.mapAll);
router.get("/pat-reg", PatRegController.getPatRegData);

export default router;