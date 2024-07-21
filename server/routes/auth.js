import { Router } from "express";
import { getMe, login, logout, signup } from "../controllers/auth.js";
import { protectedroute } from "../midlewares/protectedroute.js";

const router = Router();

router.post("/signup", signup);

router.post("/login", login);

router.get("/logout", logout);

router.get("/me",protectedroute, getMe);

export default router;
