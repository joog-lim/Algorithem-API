import {
  getModelForClass,
  prop,
  DocumentType,
  modelOptions,
  arrayProp,
  mapProp,
} from "@typegoose/typegoose";
import { ModelType } from "@typegoose/typegoose/lib/types";

import { Schema } from "mongoose";
import * as crypto from "crypto";
import { Base64 } from "js-base64";

export enum PostStatus {
  Pending = "PENDING",
  Accepted = "ACCEPTED",
  Rejected = "REJECTED",
  Deleted = "DELETED",
}

export class PostHistory {
  @prop({ required: true, trim: true })
  public content: string;

  @prop({ required: true })
  public createdAt: Date;
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

  @prop({ default: [] })
  public history: PostHistory[];

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
    const condition = {
      number: { $lt: cursor ?? 0 },
      status: PostStatus.Pending,
    };

    if (cursor === 0) {
      delete condition.number;
    }
    const posts = await this.find(condition)
      .sort({ number: -1 })
      .limit(count)
      .exec();
    return posts;
  }
}

export default getModelForClass(Post);
