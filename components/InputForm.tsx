import React, { useState } from 'react';
import { JobInput } from '../types';
import { Search, Loader2, Sparkles } from 'lucide-react';

interface InputFormProps {
  onAnalyze: (input: JobInput) => void;
  onBulkAnalyze: (industry: string) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onAnalyze, onBulkAnalyze, isLoading }) => {
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (industry && country && role) {
      onAnalyze({ industry, country, role });
    }
  };

  const handleSurprise = () => {
    if (industry) {
        onBulkAnalyze(industry);
    } else {
        // Default surprise
        onBulkAnalyze("Technology"); 
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700 shadow-xl">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-2">
          <label htmlFor="industry" className="text-sm font-medium text-slate-300">
            Industry
          </label>
          <input
            id="industry"
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. Finance, Tech"
            className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-500 outline-none transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="country" className="text-sm font-medium text-slate-300">
            Country
          </label>
          <input
            id="country"
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g. USA, Germany"
            className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-500 outline-none transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium text-slate-300">
            Job Role
          </label>
          <input
            id="role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Data Analyst"
            className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-500 outline-none transition-all"
            required
          />
        </div>

        <div className="flex gap-2">
            <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                <>
                    <Search className="w-5 h-5" />
                    <span>Analyze</span>
                </>
                )}
            </button>
            <button
                type="button"
                onClick={handleSurprise}
                disabled={isLoading}
                title="Generate top risks for this industry (or Tech if empty)"
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 p-3 rounded-lg transition-all duration-200 border border-slate-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
               <Sparkles className="w-5 h-5" />
            </button>
        </div>
      </form>
      <p className="mt-3 text-xs text-slate-400 text-center md:text-left">
        Tip: Leave Role empty and click the <Sparkles className="w-3 h-3 inline mx-1"/> button to see top 5 at-risk jobs in that industry.
      </p>
    </div>
  );
};
