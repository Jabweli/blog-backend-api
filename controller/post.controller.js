import Post from "../models/post.model.js";
import User from "../models/user.model.js";

// get all posts
export const getPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;

  const query = {};

  const cat = req.query.cat;
  const sortQuery = req.query.sort;
  const author = req.query.author;
  const featured = req.query.featured;
  const search = req.query.search;

  if (cat) {
    query.category = cat;
  }

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  if (featured) {
    query.isFeatured = true;
  }

  if (author) {
    const user = await User.findOne({ username: author }).select("_id");
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    query.user = user._id;
  }

  let sorObj = { createdAt: -1 };

  if (sortQuery) {
    switch (sortQuery) {
      case "newest":
        sorObj = { createdAt: -1 };
        break;
      case "oldest":
        sorObj = { createdAt: 1 };
        break;
      case "popular":
        sorObj = { visit: -1 };
        break;
      case "trending":
        sorObj = { visit: -1 };
        query.createAt = {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        };
        break;
      default:
        break;
    }
  }

  const posts = await Post.find(query)
    .populate("user", "username")
    .sort(sorObj)
    .limit(limit)
    .skip((page - 1) * limit);

  const totalPosts = await Post.countDocuments();
  const hasMore = page * limit < totalPosts;

  res.status(200).json({ posts, hasMore });
};

// get a single post
export const getPost = async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug }).populate(
    "user",
    "username img"
  );
  res.status(200).json(post);
};

// create post
export const createPost = async (req, res) => {
  const clerkUserId = req.auth.userId;

  if (!clerkUserId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const user = await User.findOne({ clerkUserId });

  // generate slug
  let slug = req.body.title.replace(/ /g, "-").toLowerCase();

  let existingPost = await Post.findOne({ slug });

  let counter = 2;
  while (existingPost) {
    slug = `${slug}-${counter}`;
    existingPost = await Post.findOne({ slug });
    counter++;
  }

  const newPost = new Post({ user: user._id, slug, ...req.body });

  const post = await newPost.save();
  res.status(200).json(post);
};

// delete post
export const deletePost = async (req, res) => {
  const clerkUserId = req.auth.userId;

  if (!clerkUserId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const role = req.auth.sessionClaims?.metadata?.role || "user";

  if (role) {
    await Post.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Post has been deleted!" });
  }

  const user = await User.findOne({ clerkUserId });

  const deletedPost = await Post.findOneAndDelete({
    _id: req.params.id,
    user: user._id,
  });

  if (!deletedPost) {
    return res.status(403).json({ message: "You can delete only your posts!" });
  }
  res.status(200).json({ message: "Post has been deleted!" });
};

// update post
export const updatePost = async (req, res) => {
  const clerkUserId = req.auth.userId;

  if (!clerkUserId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // generate slug
  let slug = req.body.title.replace(/ /g, "-").toLowerCase();

  const user = await User.findOne({ clerkUserId });

  const updatedPost = await Post.findOneAndUpdate(
    { _id: req.params.id, user: user._id, },
    { $set: { ...req.body, slug } },
    { new: true }
  );
  
  if (!updatedPost) return res.status(400).json({ message: "You cannot update this post" });
  res.status(200).json(updatedPost);
};

// feature post
export const featurePost = async (req, res) => {
  const clerkUserId = req.auth.userId;
  const postId = req.body.postId;

  if (!clerkUserId) {
    return res.status(401).json({ message: "You are not authenticated" });
  }

  const role = req.auth.sessionClaims?.meta?.role || "user";

  if (role !== "admin") {
    return res.status(200).json({ message: "You cannot feature this post" });
  }

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const isFeatured = post.isFeatured;

  const upatedPost = await Post.findByIdAndUpdate(
    postId,
    { isFeatured: !isFeatured },
    { new: true }
  );

  res.status(200).json(upatedPost);
};
