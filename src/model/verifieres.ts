import {
  getModelForClass,
  modelOptions,
  prop,
  DocumentType,
} from "@typegoose/typegoose";
import { Base64 } from "js-base64";

@modelOptions({
  schemaOptions: {
    collection: "verifier",
  },
})
class Verifier {
  public _id: string;

  @prop({ required: true })
  public question: string;

  @prop({ required: true })
  public answer: string;

  public getId(): string {
    return Base64.encode(this._id.toString());
  }

  public isCorrect(this: DocumentType<Verifier>, target: string): boolean {
    return this.answer == target;
  }
}

const verifierModel = getModelForClass(Verifier);
export default verifierModel;
