import {Router} from "express"
import { fileUpload} from "../controllers/user.controllers.js";


import { upload } from "../middlewares/multer.middleware.js";


const router = Router()
router.route("/file-upload").post(
    upload.single('file'),
    fileUpload)



 

//Secured routes
import { verifyJWT } from "../middlewares/auth.middleware.js";
//router.route("/logout").post(verifyJWT, logoutUser)

export default router;