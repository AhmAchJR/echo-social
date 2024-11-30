
import express from "express"
import authenticate from "../middlewares/authenticate.js"
import { uploadProfileImg } from "../middlewares/uploadMiddleware.js"
import { getProfile , getUserFriendReqs, getUserFriends, updateMyProfile} from "../controller/profileController.js"
const router = express.Router()

router.get("/:id" , authenticate , getUserFriendReqs , getUserFriends , getProfile)
// Route to view the logged-in user's own profile (without an id in the URL)
router.get("/", authenticate , getUserFriendReqs , getUserFriends , getProfile)  // This route will use the logged-in user's ID

router.patch("/:id/" , authenticate , uploadProfileImg.single("image") , updateMyProfile)


export default router