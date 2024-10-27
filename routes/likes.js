import express from 'express'
import authenticate from '../middlewares/authenticate.js'
import { createLike, deleteLike } from '../controller/likeController.js'

const router = express.Router()

router.post('/:postid/like', authenticate , createLike)
router.delete('/:postid/like/:likeid', authenticate , deleteLike)

export default router
