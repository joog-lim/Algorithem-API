import { APIGatewayEvent } from "aws-lambda";
import { Base64 } from "js-base64";

import { MiddlewareDTO, AlgorithemDTO } from "../../DTO";
import { authMiddleware } from "../../middleware/auth";
import Post from "../../model/posts";
import verifieres from "../../model/verifieres";
import { AlgorithemService } from "../../service";
import { createRes } from "../../util/serverless";

export const getAlgorithemCountAtAll: Function = async (
  event: APIGatewayEvent,
  __: any,
  ___: Function
) => {};

export const getAlgorithemList: Function = async (
  event: APIGatewayEvent,
  __: any,
  ___: Function
) => {
  return await authMiddleware({ continuous: true })(
    event,
    async (event: MiddlewareDTO.certifiedEvent) => {
      const { count, cursor, status } = event.queryStringParameters;
      const data = await AlgorithemService.GetAlgorithemList(
        {
          count: Number(count ?? "10"),
          cursor: cursor ?? "0",
          status: status ?? AlgorithemDTO.PostStatus.Accepted,
        },
        event.state.isAdmin
      );
      return createRes({ status: 200, headers: {}, body: data });
    }
  );
};

export const wirteAlogorithem: Function = async (
  event: APIGatewayEvent,
  __: any,
  ___: Function
) => {
  const { title, content, tag, verifier } = JSON.parse(event.body);
  const certified = await verifieres
    .findOne({ _id: Base64.decode(verifier.id) })
    .exec();
  if (!certified?.isCorrect(verifier.answer)) {
    // verifier이 없거나, 있더라도 값이 올바르지않은 경우
    return createRes({
      status: 401,
      body: {
        success: false,
        message: "인증을 실패하였습니다.",
      },
      headers: {},
    }); // HTTP 401
  }
  const body = await AlgorithemService.PostAlgorithem({
    title: title,
    content: content,
    tag: tag,
  });
  return createRes({ status: 200, body: body, headers: {} });
};

export const setAlogorithemStatus: Function = async (
  event: APIGatewayEvent,
  __: any,
  ___: Function
) => {
  return await authMiddleware({ continuous: false })(
    event,
    async (event: MiddlewareDTO.certifiedEvent) => {
      const { status } = JSON.parse(event.body);
      const algorithemId: string = event.pathParameters.id;

      const post = await Post.findById(algorithemId);
      if (post == null)
        return createRes({
          status: 404,
          body: { success: false, message: "알고리즘을 찾을 수 없습니다." },
        });
      const body = await AlgorithemService.AlgorithemStatusManage({
        statud: status,
        id: algorithemId,
      });
      return createRes({ status: 201, body: body, headers: {} });
    }
  );
};
export const modifyAlogirithemContent: Function = async (
  event: APIGatewayEvent,
  __: any,
  ___: Function
) => {
  return await authMiddleware({ continuous: false })(
    event,
    async (event: MiddlewareDTO.certifiedEvent) => {
      const algorithemId: string = event.pathParameters.id;
      const data: AlgorithemDTO.OptionalBasePostForm = JSON.parse(event.body);

      const body = await AlgorithemService.PatchAlgorithem(algorithemId, data);
      return createRes({ status: 200, body: body, headers: {} });
    }
  );
};

export const reportAlogorithem: Function = async (
  event: APIGatewayEvent,
  __: any,
  ___: Function
) => {
  return createRes({ status: 200, body: {}, headers: {} });
};

export const deleteAlgorithem: Function = async (
  event: APIGatewayEvent,
  __: any,
  ___: Function
) => {
  return createRes({ status: 200, body: {}, headers: {} });
};
