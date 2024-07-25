import Notification from "../model/notification.js";
import Post from "../model/posts.js";
import User from "../model/user.js";

export const createpost = async (req, res) => {
  const { text } = req.body;
  let { img } = req.body;
  const userId = req.user._id.toString();

  try {
    const user = User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!text && !img) {
      return res.status(400).json({ message: "Please provide text or image" });
    }

    if (img) {
      const reslt = await cloudinary.uploader.upload(img);
      img = reslt.secure_url;
    }

    const newPost = new Post({ user: userId, text, img });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "internal server error" });
  }
};

export const delpost = async (req, res) => {
  const userId = req.user._id.toString();

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (post.img) {
      await cloudinary.uploader
        .destroy(post.img.split("/"))
        .pop()
        .split(".")[0];
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "internal server error" });
  }
};

export const comentposts = async (req, res) => {
  const { text } = req.body;
  const userId = req.user._id;

  try {
    if (!text) {
      return res.status(400).json({ message: "Please provide a comment" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ user: userId, text });
    await post.save();

    res.status(201).json(post);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "internal server error" });
  }
};

export const likeposts = async (req, res) => {
  const userId = req.user._id;

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const isLike = post.likes.includes(userId);

    if (isLike) {
      await Post.updateOne(
        { _id: req.params.id },
        { $pull: { likes: userId } }
      );
      await User.updateOne(
        { _id: userId },
        { $pull: { likedPost: req.params.id } }
      );

      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      res.status(200).json(updatedLikes);
    } else {
      post.likes.push(userId);
      await User.updateOne(
        { _id: userId },
        { $push: { likedPost: req.params.id } }
      );
      await post.save();

      const notification = new Notification({
        to: post.user,
        type: "LIKE",
        from: req.user._id,
      });

      await notification.save();

      res.status(200).json(post.likes);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "internal server error" });
  }
};

export const getalPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (!posts) {
      return res.status(404).json({ message: "No posts found" });
    }

    if (posts.length === 0) {
      res.status(200).json([]);
    }

    res.status(200).json(posts);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "internal server error" });
  }
};

export const getFollwingPost = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const following = user.following;
    if (!following)
      return res.status(404).json({ message: "No following users found" });

    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (!feedPosts) {
      return res.status(404).json({ message: "No posts found" });
    }

    res.status(200).json(feedPosts);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "internal server error" });
  }
};

export const getLikedPosts = async (req, res) => {
	const userId = req.params.id;

	try {
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const likedPosts = await Post.find({ _id: { $in: user?.likedPost } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(likedPosts);
	} catch (error) {
		console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getUserPosts = async (req, res) => {
	try {
		const { username } = req.params;

		const user = await User.findOne({ username });
		if (!user) return res.status(404).json({ error: "User not found" });

		const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
