import { APIGatewayEvent } from "aws-lambda";
import { Base64 } from "js-base64";
import * as mongoose from "mongoose";

import { MiddlewareDTO, AlgorithemDTO } from "../../DTO";
import { ReturnResHTTPData } from "../../DTO/http";
import { AuthMiddleware } from "../../middleware/auth";
import Post from "../../model/posts";
import verifieres from "../../model/verifieres";
import { AlgorithemService } from "../../service";
import { connectOptions } from "../../util/mongodb";
import { createRes, createErrorRes } from "../../util/serverless";
import { rules, bold15, ruleForWeb, bold13 } from "../../config/rule";
import { isNumeric } from "../../util/number";

class Algorithem {
  static async getAlgorithemCountAtAll(
    _: APIGatewayEvent,
    __: any,
    ___: Function
  ): Promise<ReturnResHTTPData> {
    mongoose
      .connect(process.env.MONGO_URL ?? "", connectOptions)
      .then((): void => console.log("MongoDB connected"))
      .catch((err: Error): void =>
        console.log("Failed to connect MongoDB: ", err)
      );

    // get Number of algorithms by type
    const body: AlgorithemDTO.StatusCountList =
      await AlgorithemService.getKindOfAlgorithemCount();
    const returnValue = createRes({ body });
    return returnValue;
  }

  @AuthMiddleware.admin()
  static async getAlgorithemList(
    event: MiddlewareDTO.CertifiedEvent,
    __: any,
    ___: Function
  ): Promise<ReturnResHTTPData> {
    mongoose
      .connect(process.env.MONGO_URL ?? "", connectOptions)
      .then((): void => console.log("MongoDB connected"))
      .catch((err: Error): void =>
        console.log("Failed to connect MongoDB: ", err)
      );

    // get parameter
    const { count, cursor, status } = event.queryStringParameters;

    // check parameter
    if (status == AlgorithemDTO.PostStatus.Pending && isNumeric(cursor)) {
      return createErrorRes({ status: 404, message: "잘못된 요청입니다." });
    }
    //get algorithem list for return body value
    const body = await AlgorithemService.getAlgorithemList(
      {
        count: Number(count || "20"),
        cursor: cursor ?? "0",
        status: status ?? AlgorithemDTO.PostStatus.Accepted,
      },
      event.state.isAdmin
    );
    return createRes({ body });
  }

  // use middleware for authorized user
  @AuthMiddleware.admin()
  static async getAlgorithemListAtPages(
    event: MiddlewareDTO.CertifiedEvent,
    __: any,
    ___: Function
  ): Promise<ReturnResHTTPData> {
    mongoose
      .connect(process.env.MONGO_URL ?? "", connectOptions)
      .then((): void => console.log("MongoDB connected"))
      .catch((err: Error): void =>
        console.log("Failed to connect MongoDB: ", err)
      );

    // get parameter
    const { page, status } = event.queryStringParameters;
    if (Number(page) <= 0)
      return createErrorRes({
        message: "page값은 1부터 시작합니다.",
      });
    //get algorithem list for return body value
    const body = await AlgorithemService.getAlgorithemListAtPages(
      {
        page: Number(page || 1),
        status: status ?? AlgorithemDTO.PostStatus.Accepted,
      },
      event.state.isAdmin
    );
    return createRes({ body });
  }

  // Ability to publish algorithms for those who answered the question
  @AuthMiddleware.onlyOrigin
  static async wirteAlogorithem(
    event: APIGatewayEvent,
    __: any,
    ___: Function
  ): Promise<ReturnResHTTPData> {
    mongoose
      .connect(process.env.MONGO_URL ?? "", connectOptions)
      .then((): void => console.log("MongoDB connected"))
      .catch((err: Error): void =>
        console.log("Failed to connect MongoDB: ", err)
      );

    // get json type body values
    const { title, content, tag, verifier } = JSON.parse(event.body);

    // value check
    if (!title || !content || !tag) {
      return createErrorRes({
        message: "필숫값이 제대로 전달되지 않았습니다.",
      });
    }

    // auth answers to questions
    const certified = await verifieres
      .findOne({ _id: Base64.decode(verifier.id) })
      .exec();
    if (!certified?.isCorrect(verifier.answer)) {
      // (don't have verifier) or (have verifier but isNotCorrect answer)
      return createErrorRes({
        status: 401,
        message: "인증을 실패하였습니다.",
      });
    }

    // post algorithem
    const body = await AlgorithemService.postAlgorithem({
      title: title,
      content: content,
      tag: tag,
    });
    return createRes({ body });
  }

  // renew algorithem's status
  @AuthMiddleware.onlyOrigin
  @AuthMiddleware.admin(false)
  static async setAlogorithemStatus(
    event: MiddlewareDTO.CertifiedEvent,
    __: any,
    ___: Function
  ): Promise<ReturnResHTTPData> {
    // use auth middleware for admin
    mongoose
      .connect(process.env.MONGO_URL ?? "", connectOptions)
      .then((): void => console.log("MongoDB connected"))
      .catch((err: Error): void =>
        console.log("Failed to connect MongoDB: ", err)
      );
    try {
      //get parameter at body
      const { status, reason } = JSON.parse(event.body);

      //check status value
      if (!status) {
        return createErrorRes({
          status: 400,
          message:
            "status값이 선언되지않았습니다.\n다시 값을 확인해주시길 바랍니다.",
        });
      }

      // check status value
      if (!AlgorithemDTO.PostStatusArray.includes(status)) {
        return createErrorRes({
          status: 400,
          message:
            "status값이 부적절합니다.\nstatus값에 오타가 없는지 확인해주시길 바랍니다.",
        });
      }

      // check algorithem status
      if (
        status == AlgorithemDTO.PostStatus.Pending ||
        status == AlgorithemDTO.PostStatus.Deleted
      ) {
        return createErrorRes({
          status: 404,
          message:
            "대기 상태나 삭제 상태로 교체할 수 없습니다.\n다른 API를 확인해주세요.",
        });
      }

      // get algorithem id within path parameter
      const algorithemId: string = event.pathParameters.id;

      // get algorithem by id
      const algorithem = await Post.findById(algorithemId);

      // is algorithem null?
      if (algorithem == null)
        return createErrorRes({
          status: 404,
          message: "알고리즘을 찾을 수 없습니다.",
        });
      const body = await AlgorithemService.algorithemStatusManage({
        status,
        algorithem,
        reason,
      });
      return createRes({ body });
    } catch (error) {
      // check body is json
      if (error instanceof SyntaxError) {
        return createErrorRes({
          status: 400,
          message: "JSON 형식으로 값을 넘겨주셔야합니다.",
        });
      }
      throw error;
    }
  }

  @AuthMiddleware.onlyOrigin
  @AuthMiddleware.admin(false)
  static async modifyAlogirithemContent(
    event: MiddlewareDTO.CertifiedEvent,
    __: any,
    ___: Function
  ): Promise<ReturnResHTTPData> {
    // use auth middleware for admin

    mongoose
      .connect(process.env.MONGO_URL ?? "", connectOptions)
      .then((): void => console.log("MongoDB connected"))
      .catch((err: Error): void =>
        console.log("Failed to connect MongoDB: ", err)
      );
    // get algorithem's id and modify values with path parameters and req body
    const algorithemId: string = event.pathParameters.id;
    const data: AlgorithemDTO.OptionalBasePostForm = JSON.parse(event.body);
    // get

    //declare response body
    let body = {};
    try {
      // modify algorithem
      body = await AlgorithemService.patchAlgorithem(algorithemId, data);
    } catch {
      // catch notfound error
      return createErrorRes({
        status: 404,
        message: "해당 게시물을 찾을 수 없습니다.",
      });
    }
    return createRes({ body });
  }

  @AuthMiddleware.onlyOrigin
  static async reportAlogorithem(
    event: MiddlewareDTO.CertifiedEvent,
    __: any,
    ___: Function
  ): Promise<ReturnResHTTPData> {
    mongoose
      .connect(process.env.MONGO_URL ?? "", connectOptions)
      .then((): void => console.log("MongoDB connected"))
      .catch((err: Error): void =>
        console.log("Failed to connect MongoDB: ", err)
      );

    // get data
    const data: { reason: string } = JSON.parse(event.body);
    const id = event.pathParameters.id;

    // set status with deleted
    const body = await AlgorithemService.setDeleteStatus(id, data.reason);
    return createRes({ body });
  }

  @AuthMiddleware.onlyOrigin
  @AuthMiddleware.admin(false)
  static async deleteAlgorithem(
    event: MiddlewareDTO.CertifiedEvent,
    __: any,
    ___: Function
  ): Promise<ReturnResHTTPData> {
    // use middleware for admin
    mongoose
      .connect(process.env.MONGO_URL ?? "", connectOptions)
      .then((): void => console.log("MongoDB connected"))
      .catch((err: Error): void =>
        console.log("Failed to connect MongoDB: ", err)
      );

    // get datas
    const algorithemId: string = event.pathParameters.id;
    const data: { reason: string } = JSON.parse(event.body);

    // delete algorithem and get this algorithem information
    const body = await AlgorithemService.deleteAlgorithem(
      algorithemId,
      data.reason ?? "규칙에 위반된 알고리즘이기에 삭제되었습니다."
    );
    return createRes({ body });
  }

  static async getAlgorithemRule(
    _: APIGatewayEvent,
    __: any,
    ___: Function
  ): Promise<ReturnResHTTPData> {
    const body = {
      content: rules,
      bold13,
      bold15,
    };
    return createRes({ body });
  }

  static async getAlgorithemRuleForWeb(
    _: APIGatewayEvent,
    __: AuthMiddleware,
    ___: Function
  ): Promise<ReturnResHTTPData> {
    const body = {
      content: ruleForWeb,
    };
    return createRes({ body });
  }
}

export const getStatusList = Algorithem.getAlgorithemCountAtAll;
export const getAlgorithemList = Algorithem.getAlgorithemList;
export const getAlgorithemListAtPages = Algorithem.getAlgorithemListAtPages;
export const postAlgorithem = Algorithem.wirteAlogorithem;
export const modifyAlgorithem = Algorithem.modifyAlogirithemContent;
export const setAlgorithemStatus = Algorithem.setAlogorithemStatus;
export const deleteAlgorithem = Algorithem.deleteAlgorithem;
export const reportAlogorithem = Algorithem.reportAlogorithem;
export const getAlgorithemRules = Algorithem.getAlgorithemRule;
export const getAlgorithemRulesForWeb = Algorithem.getAlgorithemRuleForWeb;
