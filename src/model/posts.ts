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
  public status: AlgorithemDTO.PostStatusType;

  @prop({ trim: true })
  public reason: string;

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
    { title, content, tag }: AlgorithemDTO.OptionalBasePostForm
  ): Promise<DocumentType<Post>> {
    this.title = title ?? this.title;
    this.content = content ?? this.content;
    this.tag = tag ?? this.tag;
    await this.save();

    return this;
  }
  public async setStatus(
    this: DocumentType<Post>,
    arg: AlgorithemDTO.SetStatusArg
  ): Promise<DocumentType<Post>> {
    if (
      this.status == AlgorithemDTO.PostStatus.Deleted &&
      arg.status == AlgorithemDTO.PostStatus.Accepted
    ) {
      this.status = arg.status;
      this.deleteReqNumber = 0;
    } else {
      this.status = arg.status;

      // Get state-specific values
      this.number = await getPostsNumber(arg.status);
    }
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

    // get lastest deleted post's number
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

      createdAt: this.createdAt.getTime(),
      status: this.status,
      reason: this.reason ?? "",
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
      createdAt: this.createdAt.getTime(),
      status: this.status,
      deleteReqNumber: this.deleteReqNumber ?? 0,
      reason: this.reason ?? "",
    };
  }

  public static async getListAtPages(
    this: ModelType<Post> & typeof Post,
    page: number = 1,
    options: AlgorithemDTO.FindPostsOptions
  ): Promise<Array<DocumentType<Post>>> {
    const isAdminAndNotPending =
      options.admin && options.status !== AlgorithemDTO.PostStatus.Pending;
    function getCondition() {
      var statusCondition: Object = {};
      if (options.status !== AlgorithemDTO.PostStatus.Accepted) {
        statusCondition = { status: options.status };
      } else {
        statusCondition = {
          $or: [
            { status: AlgorithemDTO.PostStatus.Accepted },
            { status: AlgorithemDTO.PostStatus.Deleted },
          ], // if status is Accepted, search Accepted and deleted
        };
      }
      return function () {
        return Object.assign({}, statusCondition);
      };
    }
    return await this.find(getCondition()())
      .sort(
        // if user isn't admin, desc number
        options.admin ? { _id: isAdminAndNotPending ? -1 : 1 } : { number: -1 }
      ) // if user is admin and status is Pending, asc objectId
      .limit(20) // limited count is arg count
      .skip(20 * (page - 1))
      .exec();
  }
  public static async getList(
    this: ModelType<Post> & typeof Post,
    count: number = 10,
    cursor: string = "0",
    options: AlgorithemDTO.FindPostsOptions
  ): Promise<Array<DocumentType<Post>>> {
    // have admin and not equal status to PostStatus.Pending?
    const isAdminAndNotPending =
      options.admin && options.status !== AlgorithemDTO.PostStatus.Pending;
    function getCondition() {
      var statusCondition: Object = {};
      if (options.status !== AlgorithemDTO.PostStatus.Accepted) {
        statusCondition = { status: options.status };
      } else {
        statusCondition = {
          $or: [
            { status: AlgorithemDTO.PostStatus.Accepted },
            { status: AlgorithemDTO.PostStatus.Deleted },
          ], // if status is Accepted, search Accepted and deleted
        };
      }
      var cursorCondition: Object = {};
      if (
        cursor &&
        options.admin &&
        options.status === AlgorithemDTO.PostStatus.Pending
      ) {
        cursorCondition = {
          _id: {
            // if status is pending, desc cursor order
            [isAdminAndNotPending ? "$lt" : "$gt"]: new Types.ObjectId(cursor),
          }, // if user is admin, cursor is ObjectId
        };
      } else if (cursor) {
        cursorCondition = {
          number: {
            $lt: parseInt(cursor), // if user is not admin, cursor is number
          },
        }; // cursor가 0이라면 status만 조건에 넣어준다.
      }
      return function () {
        return Object.assign({}, statusCondition, cursorCondition);
      };
    }
    return await this.find(getCondition()())
      .sort(
        // if user isn't admin, desc number
        options.admin ? { _id: isAdminAndNotPending ? -1 : 1 } : { number: -1 }
      ) // if user is admin and status is Pending, asc objectId
      .limit(count) // limited count is arg count
      .exec();
  }
}
const PostModel = getModelForClass(Post);
export default PostModel;
