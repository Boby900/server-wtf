
import { Response, Request, NextFunction } from "express";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import crypto from "crypto";

function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

const createSession = async (
  token: string,
  userId: number
): Promise<Session | null> => {
  try {
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    );
    const session: Session = {
      id: sessionId,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    };
    await db.insert(sessionTable).values(session);
    return session;
  } catch (error) {
    console.error(error);
    return null;
  }
};



export async function invalidateSession(sessionId: string): Promise<boolean> {
  try {
    const result = await db
      .delete(sessionTable)
      .where(eq(sessionTable.id, sessionId));
    if (result.rowCount == 0) {
      console.log("No session found with the provided ID.");
      return false;
    }
    console.log(sessionId);
    console.log("Delete result:", result);
    return true; // Return true if deletion was successful
  } catch (error) {
    console.error("Failed to invalidate session:", error);
    return false; // Return false if an error occurred
  }
}

export async function validateSessionTokenHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers["token"] as string;
    // Validate the session token
    const validated = await validateSessionToken(token);
    if (!validated.session || !validated.user || !token) {
      res.status(401).json({
        status: "fail",
        message: "Token validation failed",
      });
      return;
    }
    // Attach session and user data to the request object
    req.session = validated.session;
    req.user = validated.user;
    next(); // Pass control to the next middleware/handler
  } catch (error) {
    console.error("Error validating session token:", error);
    // Return a generic error response
    res.status(500).json({
      status: "error",
      message: "Internal server error while validating session token",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function validateSessionToken(
  token: string
) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await db
    .select({ user: userTable, session: sessionTable })
    .from(sessionTable)
    .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
    .where(eq(sessionTable.id, sessionId));
  if (result.length < 1) {
    return { session: null, user: null };
  }
  const { user, session } = result[0];
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
    return { session: null, user: null };
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(sessionTable)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(sessionTable.id, session.id));
  }
  return { session, user };
}

