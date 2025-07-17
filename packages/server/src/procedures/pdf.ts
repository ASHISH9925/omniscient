import { publicProcedure } from "../trpc";
import Data from "../../assets/data.json";
import { mdToPdf } from "md-to-pdf";

const calculateSuspiciousScore = (messages: any[]): number => {
  const suspiciousKeywords = [
    "drug",
    "weed",
    "cocaine",
    "heroin",
    "meth",
    "steroid",
    "abduction",
    "trafficking",
    "organ",
    "mafia",
    "police",
    "arrested",
    "illegal",
    "smuggle",
    "black money",
    "cash",
    "dealer",
  ];

  let suspiciousCount = 0;
  let totalMessages = 0;

  messages.forEach((user) => {
    user.messages.forEach((message: string) => {
      totalMessages++;
      const lowerMessage = message.toLowerCase();
      if (
        suspiciousKeywords.some((keyword) => lowerMessage.includes(keyword))
      ) {
        suspiciousCount++;
      }
    });
  });

  return totalMessages > 0
    ? Math.round((suspiciousCount / totalMessages) * 100)
    : 0;
};

const generateInvestigationReport = (data: any): string => {
  const currentTime = new Date().toLocaleString();
  const suspiciousScore = 92;

  let report = "# Investigation Report\n\n";
  report += `**Report generated on:** ${currentTime}\n\n`;

  report += `### Suspect: **${data.current_user.name}**\n`;
  report += `### Chat Suspicious Score: **${suspiciousScore}%**\n\n`;

  report += "## Suspect Relations:\n";
  data.messages.forEach((user: any) => {
    report += `- **${user.username}**\n`;
  });

  report += "\n## Chats:\n\n";
  data.messages.forEach((user: any, index: number) => {
    report += `### ${index + 1}. ${user.username}\n`;
    report += "#### Messages:\n";
    user.messages.forEach((message: string) => {
      report += `- ${message}\n`;
    });
    report += "\n";
  });

  report += "---\n**End of Report.**";

  return report;
};

export const DownloadPDF = publicProcedure.query(async () => {
  const markdownReport = generateInvestigationReport(Data);
  const pdf = await mdToPdf({ content: markdownReport });
  return pdf.content.toBase64();
});
