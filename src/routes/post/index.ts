import * as Router from "koa-router";

import { authMiddleware } from "../../middleware/auth";
import { validatorMiddleware } from "../../middleware/validator";

import {
  deletePost,
  getPosts,
  patchPost,
  PatchPostForm,
  writePost,
} from "../../controller/post";

import { PostRequestForm } from "../../model/posts";

const post = new Router();

post.get("/get-list", authMiddleware(true), getPosts);
post.post("/create", validatorMiddleware<PostRequestForm>(), writePost);
post.patch(
  "/patch/:id",
  validatorMiddleware<PatchPostForm>(),
  authMiddleware(false),
  patchPost
);
post.delete("/delete/:arg", authMiddleware(true), deletePost);
export default post;
