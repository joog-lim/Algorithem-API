export interface BaseHTTPData {
  headers?: Object;
  body?: Object | string;
}

export interface ResHTTPData extends BaseHTTPData {
  body?: Object;
  status?: number;
}
