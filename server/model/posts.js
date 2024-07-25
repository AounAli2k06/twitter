import mongoose from "mongoose";

const PostSheme = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
  },
  img: {
    type: String,
  },
  comments: [
    {
      text: {
        type: String,
        required: true,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

}, { timestamps:true});

const Post = mongoose.model("Post", PostSheme);

export default Post;
