import express from "express";
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  updatePost,
  featurePost,
} from "../controller/post.controller.js";
import incrementVisit from "../middleware/incrementVisit.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/:slug", incrementVisit, getPost);
router.post("/", createPost);
router.delete("/:id", deletePost);
router.put("/:id", updatePost);
router.patch("/feature", featurePost);

export default router;
