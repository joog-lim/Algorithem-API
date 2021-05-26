import { getModelForClass, prop } from "@typegoose/typegoose";
import { Schema } from "mongoose";

export enum PostStatus {
  Pending = "PENDING",
  Accepted = "ACCEPTED",
  Rejected = "REJECTED",
  Deleted = "DELETED",
}

export interface PostRequestForm {
  title: string;
  content: string;
  tag: string;
}
export interface PublicPostFields {
  id: string;
  number?: number;
  title?: string;
  tag: string;
  FBLink: string;
  createdAt: number;
  status: string;
}
export class _Post {
  public _id: Schema.Types.ObjectId;
  public createdAt: Date;

  @prop()
  public number?: number;

  @prop({ required: true, trim: true, default: "" })
  public title!: string;

  @prop({ required: true, trim: true })
  public content!: string;

  @prop({ required: true })
  public tag: string;

  @prop({ enum: PostStatus, default: PostStatus.Pending })
  public status: PostStatus;

  @prop({ trim: true })
  public reason: string;

  @prop()
  public FBLink?: string;

  public get id(): Schema.Types.ObjectId {
    return this._id;
  }
}

const Post = getModelForClass(_Post);

export default Post;
