import express from "express"
import authenticate from '../middlewares/authenticate.js'
import { createComment ,  createReply , deleteComment , updateComment} from "../controller/commentController.js"

const router = express.Router()

router.post("/:postid/comment" , authenticate , createComment)
router.post("/:postid/comment/:commentid" , authenticate , createReply)
router.patch("/:postid/comment/:commentid" , authenticate , updateComment)
router.delete("/:postid/comment/:commentid" , authenticate , deleteComment)


export default router