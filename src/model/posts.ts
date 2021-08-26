import {
  getModelForClass,
  prop,
  DocumentType,
  modelOptions,
} from "@typegoose/typegoose";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { Types, Schema } from "mongoose";
import { AlgorithemDTO } from "../DTO";
import { getPostsNumber } from "../util/post";

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

  @prop({
    enum: AlgorithemDTO.PostStatus,
    default: AlgorithemDTO.PostStatus.Pending,
  })
  public status: AlgorithemDTO.PostStatus;

  @prop({ trim: true })
  public reason: string;

  @prop()
  public FBLink?: string;

  @prop()
  public deleteReqNumber?: number;

  public get cursorId(): string {
    return this._id.toString();
  }

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
    arg: AlgorithemDTO.SetStatusArg
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
    this.status = AlgorithemDTO.PostStatus.Deleted;
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

  public getPublicFields(
    this: DocumentType<Post>
  ): AlgorithemDTO.PublicPostFields {
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
  public getDeletedFields(
    this: DocumentType<Post>
  ): AlgorithemDTO.DeletedPostFields {
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
    options: AlgorithemDTO.FindPostsOptions
  ): Promise<Array<DocumentType<Post>>> {
    const isAdminAndNotPending =
      options.admin && options.status !== AlgorithemDTO.PostStatus.Pending;
    const condition = Object.assign(
      options.status !== AlgorithemDTO.PostStatus.Accepted
        ? { status: options.status }
        : {
            $or: [
              { status: AlgorithemDTO.PostStatus.Accepted },
              { status: AlgorithemDTO.PostStatus.Deleted },
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
