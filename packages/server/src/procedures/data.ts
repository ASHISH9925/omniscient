import { publicProcedure } from "../trpc";
import * as path from "path";

type Data = {
  messages: Array<{
    username: string;
    profile: {
      username: string;
      image: string;
    };
    messages: Array<string>;
  }>;
  current_user: {
    name: string;
    image: string;
  };
};

export const GetData = publicProcedure.query(async () => {
  const data = await Bun.file(
    path.join(__dirname, "..", "..", "assets", "data.json")
  ).json();
  return data as Data;
});
