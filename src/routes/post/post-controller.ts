import Post, { PostRequestForm } from "model/schema/posts";
import { Context } from "koa";
import { sendMessage } from "util/discord";

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

  const url =
    (body.tag !== "test"
      ? process.env.DISCORD_WEBHOOK
      : process.env.DISCORD_TEST_WEBHOOK) ?? "";
  await sendMessage(body, url);
};
