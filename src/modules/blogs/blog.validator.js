import { literal, z as Z } from "zod";

const blogSchema = Z.object({
  title: Z.string("title is required")
    .min(3, "the title must be at least 3 character")
    .max(40, "the max title length is 40 character"),
  author: Z.string("author name is required")
    .min(3, "the author name must be at least 3 character")
    .max(40, "the max author name length is 40 character"),
  content: Z.string().min(100, "teh content must be at least 100 character"),
  thumbnail: Z.string("thumbnail is required").url("invalid thumbnail url"),
  tags: Z.array(Z.string("tags is required"), "tags is required").optional(),
});

export default blogSchema;
