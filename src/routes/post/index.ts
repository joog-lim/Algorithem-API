import * as Router from "koa-router";

import { getPost, writePost } from "./post-controller";

const post = new Router();

post.get("/", getPost);
post.post("/", writePost);

export default post;
