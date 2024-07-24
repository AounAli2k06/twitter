import { Router } from "express";
import { protectedroute } from "../midlewares/protectedroute.js";
import { followUnfollow, getSuggestedUsers, updateUser } from "../controllers/user.js";
import { userProfile } from "../controllers/user.js";

const router = Router();

router.get("/profile/:username", userProfile);

router.get("/suggested",protectedroute, getSuggestedUsers);

router.post("/follow/:id", protectedroute ,followUnfollow);

router.post("/update",protectedroute, updateUser);


export default router;
