import { Base64 } from "js-base64";
import { AlgorithemDTO } from "../DTO";
import Post from "../model/posts";
import { getCursor } from "../util/post";

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
}: AlgorithemDTO.PostRequestForm) => {};
