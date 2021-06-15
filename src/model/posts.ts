import {
  getModelForClass,
  prop,
  DocumentType,
  modelOptions,
} from "@typegoose/typegoose";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { Types, Schema } from "mongoose";

export enum PostStatus {
  Pending = "PENDING",
  Accepted = "ACCEPTED",
  Rejected = "REJECTED",
  Deleted = "DELETED",
}

export interface FindPostsOptions {
  admin: boolean;
  status: PostStatus;
}

export interface PostRequestForm {
  title: string;
  content: string;
  tag: string;
  verifier: { id: string; answer: string };
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
export const getPostsNumber: Function = async (
  status: PostStatus
): Promise<number> => {
  const lastPost = (
    await PostModel.find({ status: status })
      .sort({ number: -1 })
      .limit(1)
      .exec()
  )[0];
  return (lastPost?.number ?? 0) + 1;
};
@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "posts",
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
export class Post {
  public _id: Schema.Types.ObjectId;

  @prop({ default: new Date() })
  public createdAt: Date;

  @prop()
  public number: number;

  @prop({ required: true, trim: true, default: "" })
  public title!: string;

  @prop({ required: true, trim: true })
  public content!: string;

  @prop({ required: true })
  public tag!: string;

  @prop({ enum: PostStatus, default: PostStatus.Pending })
  public status: PostStatus;

  @prop({ trim: true })
  public reason: string;

  @prop()
  public FBLink?: string;

  @prop()
  public deleteReqNumber?: number;

  public get id(): Schema.Types.ObjectId {
    return this._id;
  }

  public async edit(
    this: DocumentType<Post>,
    newTitle?: string,
    newContent?: string,
    newFBLink?: string
  ): Promise<DocumentType<Post>> {
    this.title = newTitle ?? this.title;
    this.content = newContent ?? this.content;
    this.FBLink = newFBLink ?? this.FBLink;
    await this.save();

    return this;
  }
  public async setStatus(
    this: DocumentType<Post>,
    arg: SetStatusArg
  ): Promise<DocumentType<Post>> {
    this.status = arg.status;
    this.number = await getPostsNumber(arg.status);
    this.reason = arg.reason ?? "";
    await this.save();
    return this;
  }
  public async setDeleted(
    this: DocumentType<Post>,
    reason: string
  ): Promise<DocumentType<Post>> {
    this.status = PostStatus.Deleted;
    this.reason = reason ?? "";
    const lastDeletedReqNumber =
      (
        await PostModel.find({
          deleteReqNumber: { $gt: 0 },
        })
          .sort({ deleteReqNumber: -1 })
          .limit(1)
          .exec()
      )[0]?.deleteReqNumber ?? 0;
    this.deleteReqNumber = lastDeletedReqNumber + 1;
    await this.save();
    return this;
  }

  public getPublicFields(this: DocumentType<Post>): PublicPostFields {
    return {
      id: this.id,
      number: this.number,
      title: this.title,
      content: this.content,
      tag: this.tag,
      FBLink: this.FBLink,
      createdAt: this.createdAt.getTime(),
      status: this.status,
    };
  }
  public getDeletedFields(this: DocumentType<Post>): DeletedPostFields {
    return {
      id: this.id,
      number: this.number,
      title: this.title,
      content: this.content,
      tag: this.tag,
      FBLink: this.FBLink,
      createdAt: this.createdAt.getTime(),
      status: this.status,
      deleteReqNumber: this.deleteReqNumber ?? 0,
    };
  }
  public static async getList(
    this: ModelType<Post> & typeof Post,
    count: number = 10,
    cursor: string = "0",
    options: FindPostsOptions
  ): Promise<Array<DocumentType<Post>>> {
    const isAdminAndNotPending =
      options.admin && options.status !== PostStatus.Pending;
    const condition = Object.assign(
      options.status !== PostStatus.Accepted
        ? { status: options.status }
        : {
            $or: [
              { status: PostStatus.Accepted },
              { status: PostStatus.Deleted },
            ],
          },
      cursor
        ? options.admin // cursor가 0이 아닐 경우 각 각 조건을 넣어줌
          ? {
              _id: {
                [isAdminAndNotPending ? "$lt" : "$gt"]: new Types.ObjectId(
                  cursor
                ),
              },
            }
          : {
              number: {
                $lt: parseInt(cursor),
              },
            } // cursor가 0이라면 status만 조건에 넣어준다.
        : {}
    );
    const posts = await this.find(condition)
      .sort(
        options.admin ? { _id: isAdminAndNotPending ? -1 : 1 } : { number: -1 }
      )
      .limit(count)
      .exec();
    return posts;
  }
}
const PostModel = getModelForClass(Post);
export default PostModel;
