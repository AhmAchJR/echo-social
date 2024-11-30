import express from "express"
import { createPost , deletePost, getAllPosts , getPostById, updatePost } from "../controller/postController.js"
import authenticate from '../middlewares/authenticate.js'
import { uploadPostImg } from "../middlewares/uploadMiddleware.js"
const router = express.Router()

router.get("/" , getAllPosts)
router.get("/:id" , getPostById)
router.post("/" , authenticate , uploadPostImg.array("postimg" , 5) ,createPost)
router.delete("/:id" , authenticate , deletePost)
router.patch("/:id" , authenticate  , uploadPostImg.array("postimg" , 5) , updatePost)
//req.files : An array containing information about each uploaded file.

export default router