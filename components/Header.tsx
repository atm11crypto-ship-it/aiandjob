import React from 'react';
import { Bot, TrendingUp } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <div className="text-center py-12 space-y-4">
      <div className="inline-flex items-center justify-center p-3 bg-slate-800 rounded-2xl shadow-xl shadow-cyan-900/20 border border-slate-700 mb-4">
        <Bot className="w-8 h-8 text-cyan-400 mr-2" />
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
          FutureWork AI
        </span>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
        Will AI Replace Your Job?
      </h1>
      <p className="text-lg text-slate-400 max-w-2xl mx-auto">
        Analyze career longevity, automation risks, and discover your next best move.
        Data-driven predictions for the evolving workforce.
      </p>
      <div className="flex justify-center gap-4 text-sm text-slate-500 pt-2">
        <div className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-1 text-emerald-400" />
            <span>Market Analysis</span>
        </div>
        <div className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2"></div>
            <span>Skill Transferability</span>
        </div>
        <div className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-2"></div>
            <span>Future Pathways</span>
        </div>
      </div>
    </div>
  );
};
