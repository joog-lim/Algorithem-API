import { CreateResInput, ReturnResHTTPData } from "../DTO/http";

export const ALLOWED_ORIGINS: string[] = [
  "http://localhost:3000",
  "https://localhost:3000",
  "http://localhost",
  "https://localhost",
  "https://joog-lim.info",
  "https://www.joog-lim.info",
  "https://jooglim.netlify.app",
];

export const createRes = (data: CreateResInput): ReturnResHTTPData => {
  const { statusCode, headers, body } = data;
  return {
    statusCode: statusCode ?? 200,
    headers: Object.assign(
      {},
      {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      headers ?? {}
    ),
    body: JSON.stringify(body ?? {}),
    isBase64Encoded: false,
  };
};

export const createErrorRes = ({
  status,
  message,
}: {
  status?: number;
  message?: string;
}): ReturnResHTTPData => {
  return {
    statusCode: status ?? 400,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      success: false,
      message: message ?? "요청이 부적절합니다.",
    }),
    isBase64Encoded: false,
  };
};
