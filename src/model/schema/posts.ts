import {
  getModelForClass,
  prop,
  DocumentType,
  modelOptions
} from "@typegoose/typegoose";
import { Schema } from "mongoose";
import * as crypto from "crypto";
import { Base64 } from "js-base64";
import { ModelType } from "@typegoose/typegoose/lib/types";

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
  title: string;
  content: string;
  tag: string;
  FBLink?: string;
  createdAt: number;
  status: string;
}
export interface PostAuthorFields extends PublicPostFields {
  hash: string;
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
export class Post {
  public _id: Schema.Types.ObjectId;

  @prop({ default: new Date() })
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

  @prop({
    default: (): string => {
      return crypto
        .createHash("sha256")
        .update(Date.now().toString())
        .digest("hex");
    },
  })
  public hash: string;

  public get cursorId(): string {
    return Base64.encode(this._id.toString());
  }
  public get id(): Schema.Types.ObjectId {
    return this._id;
  }

  public async setAccepted(this: DocumentType<Post>): Promise<boolean> {
    try {
      this.status = PostStatus.Accepted;
      const lastPost = (
        await PostModel.find().sort({ number: -1 }).limit(1).exec()
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
    this: DocumentType<Post>,
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

  public async setDeleted(this: DocumentType<Post>): Promise<boolean> {
    try {
      this.status = PostStatus.Deleted;
      await this.save();
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  }

  public getAuthorFields(this: DocumentType<Post>): PostAuthorFields {
    return {
      id: this.id,
      number: this.number,
      title: this.title,
      content: this.content,
      tag: this.tag,
      FBLink: this.FBLink,
      createdAt: this.createdAt.getTime(),
      status: this.status,
      hash: this.hash,
    };
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
  public static async getList(
    this: ModelType<Post> & typeof Post,
    count: number = 10,
    cursor: number = 0
  ): Promise<Array<DocumentType<Post>>> {
    const condition = cursor === 0 ? findCondition : {
      number: { $lt: cursor ?? 0 },
      status: PostStatus.Pending,
    };
    // TODO 리팩토링 추후 필요
    
    const posts = await this.find(condition)
      .sort({ number: -1 })
      .limit(count)
      .exec();
    return posts;
  }
}
const findCondition ={
  status: PostStatus.Pending
};
const PostModel = getModelForClass(Post);
export default PostModel
