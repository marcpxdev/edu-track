import type { AuthContext } from "../middleware/auth";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthContext;
      school?: { id: string; name: string };
    }
  }
}

export {};
