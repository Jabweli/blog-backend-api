import express from "express";
import {
  addComment,
  deleteComment,
  getAllComments,
} from "../controller/comment.controller.js";

const router = express.Router();

router.get("/:postId", getAllComments);
router.post("/:postId", addComment);
router.delete("/:id", deleteComment);

export default router;
