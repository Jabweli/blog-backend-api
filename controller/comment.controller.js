import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";

// get all comments
export const getAllComments = async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId })
    .populate("user", "username img")
    .sort({ createdAt: -1 });

  res.json(comments);
};

// add comments
export const addComment = async (req, res) => {
  const clerkUserId = req.auth.userId;
  const postId = req.params.postId;

  if (!clerkUserId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const user = await User.findOne({ clerkUserId });

  console.log(req.body);

  const newComment = new Comment({
    desc: req.body.comment,
    post: postId,
    user: user._id,
  });

  const savedComment = await newComment.save();

  res.status(201).json(savedComment);
};

// delete comment
export const deleteComment = async (req, res) => {
  const clerkUserId = req.auth.userId;

  if (!clerkUserId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const role = req.auth.sessionClaims?.metadata?.role || "user";

  if (role) {
    await Comment.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Comment has been deleted!" });
  }

  const user = await User.findOne({ _id: clerkUserId });

  const deletedComment = await Comment.findOneAndDelete({
    _id: req.params.id,
    user: user._id,
  });

  if (!deletedComment) {
    return res.status(403).json("You can only delete your comments.");
  }

  res.status(200).json("Comment deleted.");
};
