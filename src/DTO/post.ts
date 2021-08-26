export interface GetListParam {
  count: number;
  cursor: string;
  status: PostStatus;
}

export const PostStatus = {
  Pending: "PENDING",
  Accepted: "ACCEPTED",
  Rejected: "REJECTED",
  Deleted: "DELETED",
} as const;
export type PostStatus = typeof PostStatus[keyof typeof PostStatus];

export interface FindPostsOptions {
  admin: boolean;
  status: PostStatus;
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
  status: PostStatus;
  reason?: string;
}
