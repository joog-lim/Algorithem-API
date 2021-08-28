import { DocumentType } from "@typegoose/typegoose";

import PostModel, { Post as PostClass } from "../model/posts";
import { AlgorithemDTO } from "../DTO";

export const replaceLtGtQuot = (text: string): string => {
  return text.replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;");
};

export const getCursor = async (
  posts: DocumentType<PostClass>[],
  isAdmin: boolean
): Promise<string> => {
  return posts.length > 0
    ? isAdmin
      ? posts[posts.length - 1].cursorId
      : posts[posts.length - 1].number.toString()
    : "";
};

export const getPostsNumber: Function = async (
  status: AlgorithemDTO.PostStatusType
): Promise<number> => {
  const lastPost = (
    await PostModel.find({ status: status })
      .sort({ number: -1 })
      .limit(1)
      .exec()
  )[0];
  return (lastPost?.number ?? 0) + 1;
};
