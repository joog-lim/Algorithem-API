import { DocumentType } from "@typegoose/typegoose";
import { Schema } from "mongoose";

import { AlgorithemDTO } from "../DTO";
import Post, { Post as PostModel } from "../model/posts";
import {
  sendChangeStatusMessage,
  sendNewAlgorithemMessage,
  algorithemDeleteEvenetMessage,
} from "../util/discord";
import { getCursor, getPostsNumber, replaceLtGtQuot } from "../util/post";

export const getKindOfAlgorithemCount: Function = async (): Promise<
  AlgorithemDTO.StatusCountList[]
> => {
  return await Post.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
};

export const getAlgorithemList: Function = async (
  data: AlgorithemDTO.GetListParam,
  isAdmin: boolean
): Promise<AlgorithemDTO.AlgorithemList> => {
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
    cursor: await getCursor(posts, isAdmin),
    hasNext: posts.length === data.count,
  };
};

export const postAlgorithem: Function = async ({
  title,
  content,
  tag,
}: AlgorithemDTO.PostRequestForm): Promise<{ id: Schema.Types.ObjectId }> => {
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

export const algorithemStatusManage: Function = async ({
  status,
  algorithem,
  reason,
}: {
  status: AlgorithemDTO.PostStatusType;
  algorithem: DocumentType<PostModel>;
  reason?: string;
}): Promise<AlgorithemDTO.ChangeStatusReturnValue> => {
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
  return {
    title: title,
    content: content,
    tag: tag,
    beforeStatus: beforeStatus,
    afterStatus: status,
  };
};

export const patchAlgorithem: Function = async (
  id: string,
  data: AlgorithemDTO.OptionalBasePostForm
): Promise<AlgorithemDTO.PublicPostFields> => {
  return await (await (await Post.findById(id)).edit(data)).getPublicFields();
};

export const deleteAlgorithem: Function = async (
  id: string,
  reason: string
): Promise<AlgorithemDTO.PublicPostFields> => {
  const algorithem = await Post.findByIdAndRemove(id);
  await algorithemDeleteEvenetMessage(algorithem, reason);
  return await algorithem.getPublicFields();
};

export const setDeleteStatus: Function = async (
  id: string,
  reason: string
): Promise<AlgorithemDTO.PublicPostFields> => {
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
  return await algorithem.getPublicFields();
};
