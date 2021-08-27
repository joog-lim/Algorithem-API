import { DocumentType } from "@typegoose/typegoose";
import { AlgorithemDTO } from "../DTO";
import Post, { Post as PostModel } from "../model/posts";
import {
  sendChangeStatusMessage,
  sendNewAlgorithemMessage,
  algorithemDeleteEvenetMessage,
} from "../util/discord";
import { getCursor, getPostsNumber, replaceLtGtQuot } from "../util/post";

export const GetKindOfAlgorithemCount: Function = async () => {
  const data = await Post.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  return data;
};
export const GetAlgorithemList: Function = async (
  data: AlgorithemDTO.GetListParam,
  { isAdmin }: { isAdmin: boolean }
) => {
  const posts = await Post.getList(data.count, data.cursor, {
    admin: isAdmin,
    status: isAdmin ? data.status : AlgorithemDTO.PostStatus.Accepted,
  });
  return {
    posts: posts.map(
      data.status !== AlgorithemDTO.PostStatus.Deleted
        ? (value): AlgorithemDTO.PublicPostFields => value.getPublicFields()
        : (value): AlgorithemDTO.DeletedPostFields => value.getDeletedFields()
    ),
    count: await Post.count(),
    cursor: await getCursor(posts, isAdmin),
    hasNext: posts.length === data.count,
  };
};

export const PostAlgorithem: Function = async ({
  title,
  content,
  tag,
}: AlgorithemDTO.PostRequestForm) => {
  const newAlgorithem = new Post({
    title: title,
    content: replaceLtGtQuot(content),
    tag: tag,
    number: await getPostsNumber(AlgorithemDTO.PostStatus.Pending),
    createdAt: new Date(),
  }).save();

  await sendNewAlgorithemMessage({ title, content, tag });
  return { id: (await newAlgorithem)._id };
};

export const AlgorithemStatusManage: Function = async ({
  status,
  algorithem,
  reason,
}: {
  status: AlgorithemDTO.PostStatus;
  algorithem: DocumentType<PostModel>;
  reason?: string;
}) => {
  const beforeStatus = algorithem.status;

  const result = await algorithem.setStatus({ status: status });
  const { title, content, tag } = result;
  await sendChangeStatusMessage(
    {
      title: title,
      content: content,
      tag: tag,
    },
    { beforeStatus: beforeStatus, afterStatus: status },
    reason ?? undefined
  );
};

export const PatchAlgorithem: Function = async (
  id: string,
  data: AlgorithemDTO.OptionalBasePostForm
) => {
  return await Post.findById(id).edit(data);
};

export const DeleteAlgorithem: Function = async (
  id: string,
  reason: string
) => {
  const algorithem = await Post.findByIdAndRemove(id);
  await algorithemDeleteEvenetMessage(algorithem, reason);
  return algorithem;
};

export const SetDeleteStatus: Function = async (id: string, reason: string) => {
  const algorithem = await (await Post.findById(id)).setDeleted(reason);
  const { title, content, tag } = algorithem;
  await sendChangeStatusMessage(
    { title: title, content: content, tag: tag },
    {
      beforeStatus: AlgorithemDTO.PostStatus.Accepted,
      afterStatus: AlgorithemDTO.PostStatus.Deleted,
    },
    reason ?? undefined
  );
  return algorithem;
};
