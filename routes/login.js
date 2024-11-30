import express from "express";
import { logIn } from "../controller/loginController.js";

const router = express.Router()

router.post("/" , logIn)
router.get("/" , (req,res)=>{
    return res.render('login')
})

export default router 