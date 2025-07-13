import { publicProcedure } from "../trpc";
import Data from "../../assets/data.json";

export const GetCSV = publicProcedure.query(async () => {
  let csvContent = "User,Message,Time\n";

  for (const user of Data.messages) {
    for (const message of user.messages) {
      const parts = message.split(", ");
      if (parts.length >= 2) {
        const messageContent = parts[0];
        const timestamp = parts[1];

        csvContent += `"${user.username}","${messageContent}","${timestamp}"\n`;
      } else {
        csvContent += `"${user.username}","${message}",""\n`;
      }
    }
  }

  return csvContent;
});
