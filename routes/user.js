import express from "express";
import { getUserById , updateUser , deleteUser } from "../controller/userController.js"
import authenticate from "../middlewares/authenticate.js";
import { uploadProfileImg } from "../middlewares/uploadMiddleware.js";
import authorizing from "../middlewares/authorizing.js";
const router = express.Router()

router.get("/:id" , getUserById)
router.patch("/:id/" , authenticate , uploadProfileImg.single("image") , updateUser)
router.delete("/:id" , authorizing , deleteUser)

export default router