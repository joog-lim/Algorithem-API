import * as Router from "koa-router";
import { authMiddleware } from "middleware/auth";

import { deletePost, getPosts, patchPost, writePost } from "controller/post";

const post = new Router();

post.get("/", authMiddleware(true), getPosts);
post.post("/", writePost);
post.patch("/:id", authMiddleware(false), patchPost);
post.delete("/:arg", authMiddleware(true), deletePost);
export default post;
