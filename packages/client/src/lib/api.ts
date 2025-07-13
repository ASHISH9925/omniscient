import type { AppRouter } from "server/src/server";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();
export const apiURL = import.meta.env.VITE_PUBLIC_API_URL;

if (!apiURL) {
  throw new Error("VITE_PUBLIC_API_URL is not set");
}
