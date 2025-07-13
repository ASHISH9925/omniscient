import { getMessageAnalysis } from "./procedures/config";
import { GetCSV } from "./procedures/csv";
import { GetData } from "./procedures/data";
import { DownloadPDF } from "./procedures/pdf";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  config: getMessageAnalysis,
  data: GetData,
  score: publicProcedure.query(() => 92),
  pdf: DownloadPDF,
  csv: GetCSV
});
export type AppRouter = typeof appRouter;
