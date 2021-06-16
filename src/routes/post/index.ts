import * as Router from "koa-router";

import { authMiddleware } from "middleware/auth";
import { validatorMiddleware } from "middleware/validator";

import {
  deletePost,
  getPosts,
  patchPost,
  PatchPostForm,
  writePost,
} from "controller/post";

import { PostRequestForm } from "model/posts";

const post = new Router();

post.get("/", authMiddleware(true), getPosts);
post.post("/", validatorMiddleware<PostRequestForm>(), writePost);
post.patch(
  "/:id",
  validatorMiddleware<PatchPostForm>(),
  authMiddleware(false),
  patchPost
);
post.delete("/:arg", authMiddleware(true), deletePost);
export default post;
