import { FileText, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/api";

const downloadFile = (filename: string, base64: string, mimeType: string) => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const pdfBlob = new Blob([byteArray], { type: mimeType });
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const a = document.createElement("a");
  a.href = pdfUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(pdfUrl);
};

export const Navbar = () => {
  const pdfQuery = trpc.pdf.useQuery(undefined, {
    enabled: false,
  });

  const csvQuery = trpc.csv.useQuery(undefined, {
    enabled: false,
  });


  const downloadPDF = async () => {
    const { data: pdfBase64 } = await pdfQuery.refetch();
    if (!pdfBase64) return alert("Failed to Download PDF");
    downloadFile("omniscient.pdf", pdfBase64, "application/pdf");
  };

  const downloadCSV = async () => {
    const { data: csvString } = await csvQuery.refetch();
    if (!csvString) return alert("Failed to Download CSV");
    
    const csvBlob = new Blob([csvString], { type: "text/csv" });
    const csvUrl = URL.createObjectURL(csvBlob);
    const a = document.createElement("a");
    a.href = csvUrl;
    a.download = "omniscient.csv";
    a.click();
    URL.revokeObjectURL(csvUrl);
  };
  

  return (
    <nav className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <div className="text-xl font-bold text-white">Omniscient</div>
      </div>

      <div className="flex items-center space-x-2">
        {(pdfQuery.isFetching && (
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span className="text-sm">Generating PDF...</span>
          </Button>
        )) || (
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-700"
            onClick={downloadPDF}
          >
            <FileText className="h-4 w-4 mr-2" />
            <span className="text-sm">PDF</span>
          </Button>
        )}

        {(csvQuery.isFetching && (
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span className="text-sm">Generating CSV...</span>
          </Button>
        )) || (
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-700"
            onClick={downloadCSV}
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="text-sm">CSV</span>
          </Button>
        )}
      </div>
    </nav>
  );
};
