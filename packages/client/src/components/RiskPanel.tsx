
import { trpc } from '@/lib/api';
import { AlertTriangle } from 'lucide-react';

export const RiskPanel = () => {
    const { data: score, isPending: isScorePending } = trpc.score.useQuery();
  if (isScorePending) {
    return <div>Loading...</div>;
  }
  
  
  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="text-sm text-slate-400 mb-2">Risk Level</div>
      
      <div className="flex items-center space-x-4">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-slate-700"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              className="text-teal-500"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - score / 100)}`}
              style={{
                transition: 'stroke-dashoffset 1s ease-in-out',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-white">{score}%</span>
          </div>
        </div>
        
        <div>
          <div className="text-lg font-semibold text-white mb-1">High Risk</div>
          <div className="flex items-center text-sm text-slate-400">
            <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
            Risk is high, chats are unsafe
          </div>
        </div>
      </div>
    </div>
  );
};
