import React, { useState } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ResultsTable } from './components/ResultsTable';
import { SheetConnector } from './components/SheetConnector';
import { JobInput, PredictionData } from './types';
import { generatePrediction, generateBulkPredictions } from './services/geminiService';
import { checkAndSaveToSheet, searchInSheet, updateSheetRow } from './services/sheetService';
import { Database, RefreshCw } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSheetConnected, setIsSheetConnected] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<'hit' | 'stale_updated' | null>(null);

  const handleAnalyze = async (input: JobInput) => {
    setLoading(true);
    setError(null);
    setData([]);
    setCacheStatus(null);

    let rowToUpdate: number | null = null;

    try {
      // 1. Check Sheet Cache
      if (isSheetConnected) {
        const searchResult = await searchInSheet(input.industry, input.country, input.role);
        
        if (searchResult) {
          if (!searchResult.isStale) {
            // Fresh hit
            setData([searchResult.data]);
            setCacheStatus('hit');
            setLoading(false);
            return;
          } else {
            // Stale hit - proceed to fetch but remember to update this row
            console.log("Found stale data, refreshing...");
            rowToUpdate = searchResult.rowIndex;
          }
        }
      }

      // 2. Fetch from Gemini
      const result = await generatePrediction(input);
      setData(result);

      // 3. Save or Update Sheet
      if (isSheetConnected && result.length > 0) {
        if (rowToUpdate) {
          await updateSheetRow(rowToUpdate, result[0]);
          setCacheStatus('stale_updated');
        } else {
          await checkAndSaveToSheet(result);
        }
      }

    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAnalyze = async (industry: string) => {
    setLoading(true);
    setError(null);
    setData([]);
    setCacheStatus(null);

    try {
      const result = await generateBulkPredictions(industry);
      setData(result);

      if (isSheetConnected && result.length > 0) {
        await checkAndSaveToSheet(result);
      }
    } catch (err: any) {
        setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      
      <div className="absolute top-4 right-4 z-10">
        <SheetConnector onConnected={() => setIsSheetConnected(true)} />
      </div>

      <main className="relative container mx-auto px-4 pb-20 pt-6">
        <Header />
        
        <div className="mt-8">
          <InputForm 
            onAnalyze={handleAnalyze} 
            onBulkAnalyze={handleBulkAnalyze}
            isLoading={loading} 
          />
        </div>

        {error && (
            <div className="max-w-4xl mx-auto mt-8 p-4 bg-red-900/20 border border-red-800/50 rounded-lg text-red-200 text-center">
                {error}
            </div>
        )}

        {cacheStatus === 'hit' && (
             <div className="max-w-4xl mx-auto mt-4 px-4">
                 <div className="inline-flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-900 px-3 py-1 rounded-full">
                    <Database className="w-3 h-3" />
                    Loaded from Google Sheet
                 </div>
             </div>
        )}

        {cacheStatus === 'stale_updated' && (
             <div className="max-w-4xl mx-auto mt-4 px-4">
                 <div className="inline-flex items-center gap-2 text-xs text-amber-400 bg-amber-950/30 border border-amber-900 px-3 py-1 rounded-full">
                    <RefreshCw className="w-3 h-3" />
                    Data was outdated. Refreshed from AI & updated Sheet.
                 </div>
             </div>
        )}

        <ResultsTable data={data} />
      </main>
    </div>
  );
}
