import { Request } from "express";
import type { Session, User } from "./src/db/schema";


// Extend Express Request type globally
declare global {
  namespace Express {
    export interface Request {
      session?: Session;
      user?: CustomUser;
    }
  }
}
