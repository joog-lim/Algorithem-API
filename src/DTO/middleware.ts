import { APIGatewayEvent } from "aws-lambda";

export type CertifiedEvent = APIGatewayEvent & { state?: { isAdmin: boolean } };
