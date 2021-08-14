import { Context } from "koa";
import * as createError from "http-errors";
import { DocumentType } from "@typegoose/typegoose";

import { Base64 } from "js-base64";

import Post, {
  PostRequestForm,
  PostStatus,
  PublicPostFields,
  getPostsNumber,
  DeletedPostFields,
  Post as PostClass,
} from "../model/posts";

import { sendDeleteMessage, sendUpdateMessage } from "../util/discord";
import { replaceLtGtQuot } from "../util/post";
import verifieres from "../model/verifieres";
interface GetListParam {
  count: number;
  cursor: string;
  status: PostStatus;
}
const getCursor = async (
  posts: DocumentType<PostClass>[],
  isAdmin: boolean
): Promise<string> => {
  return posts.length > 0
    ? isAdmin
      ? posts[posts.length - 1].cursorId
      : posts[posts.length - 1].number.toString()
    : "";
};
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
    posts: posts.map(
      data.status !== PostStatus.Deleted
        ? (value): PublicPostFields => value.getPublicFields()
        : (value): DeletedPostFields => value.getDeletedFields()
    ),
    count: await Post.count(),
    cursor: await getCursor(posts, ctx.state.isAdmin),
    hasNext: posts.length === data.count,
  };
};

export const writePost = async (ctx: Context): Promise<void> => {
  const body: PostRequestForm = ctx.state.validator.data;
  const verifier = await verifieres
    .findOne({ _id: Base64.decode(body.verifier.id) })
    .exec();
  if (!verifier?.isCorrect(body.verifier.answer)) {
    // verifier이 없거나, 있더라도 값이 올바르지않은 경우
    throw new createError.Unauthorized(); // HTTP 401
  }

  const result = new Post({
    title: body.title,
    content: replaceLtGtQuot(body.content),
    tag: body.tag,
    number: await getPostsNumber(PostStatus.Pending),
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
        if (body.reason == null) throw new createError.BadRequest();
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
  const post = await Post.findById(ctx.params.arg);
  if (post == null) throw new createError.NotFound();

  if (!isAdmin) {
    const reason: string = ctx.request.body.reason;
    await post.setDeleted(reason);
    await sendDeleteMessage({
      coment: "제보 삭제 요청입니다.",
      reasaon: reason ?? "",
      number: post.number,
      url: process.env.DISCORD_MANAGEMENT_WEBHOOK,
    });
  } else {
    await post.remove();
  }

  ctx.status = 200;
  ctx.body = { result: "success" };
};
