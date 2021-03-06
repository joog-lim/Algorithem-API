import { DocumentType } from "@typegoose/typegoose";
import { Schema } from "mongoose";

import { AlgorithemDTO } from "../DTO";
import Post, { Post as PostModel } from "../model/posts";
import {
  sendNewAlgorithemMessage,
  algorithemDeleteEvenetMessage,
  sendReportMessage,
  sendSetRejectedMessage,
  sendACCEPTEDAlgorithemMessage,
} from "../util/discord";
import { getCursor, getPostsNumber, replaceLtGtQuot } from "../util/post";

export const getKindOfAlgorithemCount: Function = async (): Promise<
  AlgorithemDTO.StatusCountList[]
> => {
  return await Post.aggregate([
    // count grouping status
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
};

export const getAlgorithemList: Function = async (
  data: AlgorithemDTO.GetListParam,
  isAdmin: boolean
): Promise<AlgorithemDTO.AlgorithemList> => {
  // get algorithem list
  const posts = await Post.getList(data.count, data.cursor, {
    admin: isAdmin,
    status: isAdmin ? data.status : AlgorithemDTO.PostStatus.Accepted,
  });

  // separate algorithem list
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

export const getAlgorithemListAtPages: Function = async (
  data: AlgorithemDTO.GetPagesParam,
  isAdmin: boolean
): Promise<AlgorithemDTO.AlgorithemPage> => {
  // get algorithem list
  const posts = await Post.getListAtPages(data.page, {
    admin: isAdmin,
    status: isAdmin ? data.status : AlgorithemDTO.PostStatus.Accepted,
  });

  // separate algorithem list
  return {
    posts: posts.map(
      data.status !== AlgorithemDTO.PostStatus.Deleted
        ? (value): AlgorithemDTO.PublicPostFields => value.getPublicFields()
        : (value): AlgorithemDTO.DeletedPostFields => value.getDeletedFields()
    ),
    totalPage:
      ~~((await Post.countDocuments({ status: data.status })) / 20) + 1,
  };
};

export const postAlgorithem: Function = async ({
  title,
  content,
  tag,
}: AlgorithemDTO.PostRequestForm): Promise<{ id: Schema.Types.ObjectId }> => {
  // post new algorithem
  const newAlgorithem = await new Post({
    title: replaceLtGtQuot(title),
    content: replaceLtGtQuot(content),
    tag: replaceLtGtQuot(tag),
    number: await getPostsNumber(AlgorithemDTO.PostStatus.Pending),
    createdAt: new Date(),
  }).save();

  // send message for discord log
  await sendNewAlgorithemMessage({ title, content, tag });
  return { id: newAlgorithem._id };
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

  // change algorithem status
  const result = await algorithem.setStatus({ status, reason });
  const { title, content, tag } = result;
  const messageBody = { title, content, tag };
  // send message for discord log
  switch (status) {
    case AlgorithemDTO.PostStatus.Rejected:
      await sendSetRejectedMessage(messageBody, reason ?? undefined);
      break;
    case AlgorithemDTO.PostStatus.Accepted:
      if (beforeStatus == AlgorithemDTO.PostStatus.Deleted) {
        break;
      }
      await sendACCEPTEDAlgorithemMessage(messageBody, reason ?? undefined);
      break;
    case AlgorithemDTO.PostStatus.Deleted:
      await sendReportMessage(messageBody, reason ?? undefined);
      break;
    default:
      break;
  }
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
  // update algorithem, and get public fields
  return (await (await Post.findById(id)).edit(data)).getPublicFields();
};

export const deleteAlgorithem: Function = async (
  id: string,
  reason: string
): Promise<AlgorithemDTO.PublicPostFields> => {
  // find by and remove post with id
  const algorithem = await Post.findByIdAndDelete(id);

  // send message for discord log
  await algorithemDeleteEvenetMessage(algorithem, reason);
  return algorithem.getPublicFields();
};

export const setDeleteStatus: Function = async (
  id: string,
  reason: string
): Promise<AlgorithemDTO.PublicPostFields> => {
  // find algorithem and change status with deleted
  const algorithem = await (await Post.findById(id)).setDeleted(reason);
  const { title, content, tag } = algorithem;

  // send message for discord log
  await sendReportMessage(
    { title: title, content: content, tag: tag },
    reason ?? undefined
  );
  return algorithem.getPublicFields();
};
