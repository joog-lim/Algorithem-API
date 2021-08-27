export interface GetListParam {
  count: number;
  cursor: string;
  status: PostStatusType;
}

export const PostStatus = {
  Pending: "PENDING",
  Accepted: "ACCEPTED",
  Rejected: "REJECTED",
  Deleted: "DELETED",
} as const;
export type PostStatusType = typeof PostStatus[keyof typeof PostStatus];
export const PostStatusArray = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "DELETED",
] as const;
export interface FindPostsOptions {
  admin: boolean;
  status: PostStatusType;
}

export interface PostRequestForm {
  title: string;
  content: string;
  tag: string;
}
export interface VerifierAnswer {
  id: string;
  answer: string;
}
export interface PublicPostFields {
  id: string;
  number?: number;
  title: string;
  content: string;
  tag: string;
  FBLink?: string;
  createdAt: number;
  status: string;
}
export interface DeletedPostFields extends PublicPostFields {
  deleteReqNumber: number;
}
export interface SetStatusArg {
  status: PostStatusType;
  reason?: string;
}

export interface OptionalBasePostForm {
  title?: string;
  content?: string;
  tag?: string;
}
