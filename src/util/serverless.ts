import { CreateResInput, ReturnResHTTPData } from "../DTO/http";

const ALLOWED_ORIGINS: string[] = [
  "http://localhost:3000",
  "https://localhost:3000",
  "http://localhost",
  "https://localhost",
  "https://joog-lim.info",
  "https://www.joog-lim.info",
];

function isIncludeOrigins(origin: string): boolean {
  return ALLOWED_ORIGINS.includes(origin);
}
export const createRes = (
  data: CreateResInput,
  origin: string
): ReturnResHTTPData => {
  const { status, headers, body } = data;
  return {
    status: status ?? 200,
    headers: Object.assign(
      {},
      {
        "Access-Control-Allow-Origin": isIncludeOrigins(origin) ? origin : "",
        "Access-Control-Allow-Credentials": true,
      },
      headers ?? {}
    ),
    body: JSON.stringify(body ?? {}),
  };
};

export const createErrorRes = ({
  status,
  message,
  origin,
}: {
  status?: number;
  message?: string;
  origin: string;
}): ReturnResHTTPData => {
  return {
    status: status ?? 400,
    headers: {
      "Access-Control-Allow-Origin": isIncludeOrigins(origin) ? origin : "",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      success: false,
      message: message ?? "요청이 부적절합니다.",
    }),
  };
};
