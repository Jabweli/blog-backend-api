import express from "express";
import { getAllSavedPosts, savePost } from "../controller/user.controller.js";

const router = express.Router();

router.get("/saved-posts", getAllSavedPosts);
router.patch("/save", savePost);

export default router;
