import Post, { PostRequestForm } from "model/schema/posts";
import { Context } from "koa";
import { sendMessage, sendTestMessage } from "util/discord";

export const getPost = async (ctx: Context): Promise<void> => {};
export const writePost = async (ctx: Context): Promise<void> => {
  const body: PostRequestForm = ctx.request.body;

  const result = new Post({
    title: body.title,
    content: body.content,
    tag: body.tag,
  }).save();

  ctx.status = 201;
  ctx.set("Location", "/");
  ctx.body = { id: (await result)._id };

  if (body.tag !== "test") {
    await sendMessage(body);
  } else {
    await sendTestMessage(body);
  }
};
