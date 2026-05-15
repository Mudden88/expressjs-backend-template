import { Request } from "express";
export interface DecodedToken {
  [key: string]: any;
}

export interface AuthRequest extends Request {
  user?: DecodedToken;
}