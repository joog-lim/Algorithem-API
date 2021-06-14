import { Context } from "koa";
import * as createError from "http-errors";

import Post, {
  PostRequestForm,
  PostStatus,
  PublicPostFields,
  getPostsNumber,
} from "model/posts";

import { sendDeleteMessage, sendUpdateMessage } from "util/discord";
import { replaceLtGt } from "util/post";

interface GetListParam {
  count: number;
  cursor: string;
  status: PostStatus;
}

export const getPosts = async (ctx: Context): Promise<void> => {
  const data: GetListParam = {
    count: Number(ctx.request.query.count ?? "10"),
    cursor: (ctx.request.query.cursor ?? "0") as string,
    status: ctx.request.query.status as PostStatus,
  };
  const posts = await Post.getList(data.count, data.cursor, {
    admin: ctx.state.isAdmin,
    status: ctx.state.isAdmin ? data.status : PostStatus.Accepted,
  });
  ctx.status = 200;
  ctx.body = {
    posts: posts.map((value): PublicPostFields => value.getPublicFields()),
    cursor: posts.length > 0 ? posts[posts.length - 1].number : null,
    hasNext: posts.length === data.count,
  };
};

export const writePost = async (ctx: Context): Promise<void> => {
  const body: PostRequestForm = ctx.request.body;

  const result = new Post({
    title: body.title,
    content: replaceLtGt(body.content),
    tag: body.tag,
    number: await getPostsNumber({ status: PostStatus }),
    createdAt: new Date(),
  }).save();

  ctx.status = 201;
  ctx.set("Location", "/");
  ctx.body = { id: (await result)._id };

  const url =
    (body.tag !== "test"
      ? process.env.DISCORD_MANAGEMENT_WEBHOOK
      : process.env.DISCORD_TEST_WEBHOOK) ?? "";
  await sendUpdateMessage(body, url);
};

export interface PatchPostForm {
  status?: string;
  title?: string;
  content?: string;
  FBLink?: string;
  reason?: string;
}
export const patchPost = async (ctx: Context): Promise<void> => {
  const body: PatchPostForm = ctx.request.body;
  let result;

  const post = await Post.findById(ctx.params.id);
  if (post == null) throw new createError.NotFound();
  if (body.status != null) {
    switch (body.status) {
      case PostStatus.Accepted:
        if (post.number != null)
          throw new createError.UnavailableForLegalReasons();
        result = await post.setStatus({ status: PostStatus.Accepted });
        await sendUpdateMessage(
          {
            title: result.title,
            content: result.content,
            tag: result.tag,
          },
          process.env.DISCORD_WEBHOOK
        );
        break;
      case PostStatus.Rejected:
        if (post.reason == null) throw new createError.BadRequest();
        result = await post.setStatus({
          status: PostStatus.Rejected,
          reason: body.reason ?? "내용이 부적절합니다.",
        });
        break;
      default:
        throw new createError.BadRequest();
    }
  } else {
    if (body.content == null && body.FBLink == null)
      throw new createError.BadRequest();
    result = await post.edit(body.title, body.content, body.FBLink);
  }
  ctx.status = 200;
  ctx.body = result.toJSON();
};

export const deletePost = async (ctx: Context): Promise<void> => {
  const isAdmin: boolean = ctx.state.isAdmin;
  const post = isAdmin
    ? await Post.findById(ctx.params.arg)
    : await Post.findOne({ hash: ctx.params.arg });
  if (post == null) throw new createError.NotFound();

  if (!isAdmin) {
    await post.setStatus({ status: PostStatus.Deleted });
    await sendDeleteMessage(
      "제보 삭제 요청입니다.",
      process.env.DISCORD_MANAGEMENT_WEBHOOK
    );
  } else {
    await post.remove();
  }

  ctx.status = 200;
  ctx.body = { result: "success" };
};
