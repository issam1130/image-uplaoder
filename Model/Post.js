import { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      required: true,
    },
    image: {
      type: String, // filename stored by multer
    },
  },
  { versionKey: false, timestamps: true }
);

const Post = model("post", postSchema);
export default Post;
