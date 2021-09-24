export interface GetListParam {
  count: number;
  cursor: string;
  status: PostStatusType;
}

export interface GetPagesParam {
  page: number;
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
  createdAt: number;
  status: string;
  reason: string;
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

export interface StatusCountList {
  _id: PostStatusType;
  count: number;
}

export interface AlgorithemObjects {
  posts: PublicPostFields[];
}
export interface AlgorithemList extends AlgorithemObjects {
  cursor: string;
  hasNext: boolean;
}
export interface AlgorithemPage extends AlgorithemObjects {
  totalPage: number;
}

export interface ChangeStatusReturnValue {
  title: string;
  content: string;
  tag: string;
  beforeStatus: PostStatusType;
  afterStatus: PostStatusType;
}
