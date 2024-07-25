import { Router } from "express";
import { protectedroute } from "../midlewares/protectedroute.js";
import {
  comentposts,
  createpost,
  delpost,
  getalPost,
  getFollwingPost,
  getLikedPosts,
  getUserPosts,
  likeposts,
} from "../controllers/post.js";

const router = Router();

router.post("/create", protectedroute, createpost);

router.get("/getall", protectedroute, getalPost);

router.get("/following", protectedroute, getFollwingPost);

router.get("/likes/:id", protectedroute, getLikedPosts);

router.get("/user/:username", protectedroute, getUserPosts);

router.post("/comment/:id", protectedroute, comentposts);

router.post("/like/:id", protectedroute, likeposts);

router.delete("/:id", protectedroute, delpost);

export default router;
