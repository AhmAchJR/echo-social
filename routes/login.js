import express from "express";
import { logIn } from "../controller/loginController.js";

const router = express.Router()

router.post("/" , logIn)

export default router 