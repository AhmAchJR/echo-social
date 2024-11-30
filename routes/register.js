import express from "express";
import { signUp } from "../controller/registerController.js";
import { uploadProfileImg } from "../middlewares/uploadMiddleware.js";
const router = express.Router();

router.post("/" , uploadProfileImg.single("img") ,signUp);

export default router 