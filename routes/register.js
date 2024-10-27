import express from "express";
import { signUp } from "../controller/registerController.js";

const router = express.Router();

router.post("/" , signUp);

export default router 