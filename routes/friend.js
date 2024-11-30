
import express from "express"
import { acceptFriendRequest , addFriendRequest, cancelMyAddRequest, deleteFriendRequest, rejectFreindRequest } from "../controller/friendController.js"
const router = express.Router()

router.post("/add" , addFriendRequest)
router.post("/delete" , deleteFriendRequest)

router.post("/accept" , acceptFriendRequest)
router.post("/reject" , rejectFreindRequest)

router.post("/cancel" , cancelMyAddRequest)

export default router