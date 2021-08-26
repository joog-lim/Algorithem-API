import { APIGatewayEvent } from "aws-lambda";
import { MiddlewareDTO } from "../../DTO";
import { authMiddleware } from "../../middleware/auth";
import { createRes } from "../../util/serverless";

export const getAlgorithemList: Function = async (
  event: APIGatewayEvent,
  __: any,
  ___: Function
) => {
  return await authMiddleware({ continuous: true })(
    event,
    async (event: MiddlewareDTO.certifiedEvent) => {
      return createRes({ status: 200, headers: {}, body: {} });
    }
  );
};

export const wirteAlogorithem: Function = async (
  event: APIGatewayEvent,
  __: any,
  ___: Function
) => {
  return createRes({ status: 200, body: {}, headers: {} });
};
export const setAlogorithemStatus: Function = async (
  event: APIGatewayEvent,
  __: any,
  ___: Function
) => {
  return createRes({ status: 200, body: {}, headers: {} });
};
export const modifyAlogirithemContent: Function = async (
  event: APIGatewayEvent,
  __: any,
  ___: Function
) => {
  return createRes({ status: 200, body: {}, headers: {} });
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
