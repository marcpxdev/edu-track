import dotenv from "dotenv";

dotenv.config();

const required = ["DATABASE_URL", "SESSION_SECRET", "FRONTEND_URL"];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  SESSION_SECRET: process.env.SESSION_SECRET!,
  FRONTEND_URL: process.env.FRONTEND_URL!,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  PORT: Number(process.env.PORT ?? 3001),
  NODE_ENV: (process.env.NODE_ENV ?? "development") as "development" | "production" | "test",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV !== "production",
} as const;
