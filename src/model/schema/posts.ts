import {
  getModelForClass,
  prop,
  DocumentType,
  modelOptions,
} from "@typegoose/typegoose";
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
  content: string;
  tag: string;
  FBLink: string;
  createdAt: number;
  status: string;
}

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "_posts",
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
      transform: (doc, ret): unknown => {
        ret.createdAt = doc.createdAt.getTime();
        return ret;
      },
    },
  },
})
export class _Post {
  public _id: Schema.Types.ObjectId;
  public createdAt: Date = new Date();

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

  public async setAccepted(this: DocumentType<_Post>): Promise<boolean> {
    try {
      this.status = PostStatus.Accepted;
      const lastPost = (
        await Post.find().sort({ number: -1 }).limit(1).exec()
      )[0];
      this.number = (lastPost.number ?? 0) + 1;
      await this.save();
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  }

  public async setRejected(
    this: DocumentType<_Post>,
    reason: string
  ): Promise<boolean> {
    try {
      this.status = PostStatus.Rejected;
      this.reason = reason;
      await this.save();
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  }

  public async setDeleted(this: DocumentType<_Post>): Promise<boolean> {
    try {
      this.status = PostStatus.Deleted;
      await this.save();
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  }
}

const Post = getModelForClass(_Post);

export default Post;
