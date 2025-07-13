
import { FileText, Download, Settings, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Navbar = () => {
  return (
    <nav className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <div className="text-xl font-bold text-white">
          Omniscient
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700">
          <Eye className="h-4 w-4 mr-2" />
          <span className="text-sm">90%</span>
        </Button>
        
        <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700">
          <FileText className="h-4 w-4 mr-2" />
          <span className="text-sm">PDF</span>
        </Button>
        
        <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700">
          <Download className="h-4 w-4 mr-2" />
          <span className="text-sm">CSV</span>
        </Button>
        
        <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
};
