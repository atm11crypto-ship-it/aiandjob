import React from 'react';
import { PredictionData } from '../types';
import { Download, AlertTriangle, ArrowRight, Briefcase, ListTodo } from 'lucide-react';

interface ResultsTableProps {
  data: PredictionData[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  if (data.length === 0) return null;

  const downloadCSV = () => {
    const headers = [
      "Industry",
      "Country",
      "Role",
      "One-Sentence Job Description",
      "Predicted Replacement (Year-Month)",
      "Confidence",
      "What It Will Be Replaced With",
      "Transferable Skills",
      "Job to Aim For",
      "Steps to Start"
    ];

    const csvRows = [
      headers.join(','),
      ...data.map(row => {
        return [
          JSON.stringify(row.industry),
          JSON.stringify(row.country),
          JSON.stringify(row.role),
          JSON.stringify(row.jobDescription),
          JSON.stringify(row.predictionDate),
          JSON.stringify(row.confidence),
          JSON.stringify(row.replacementTechnology),
          JSON.stringify(row.transferableSkills),
          JSON.stringify(row.futureJob),
          JSON.stringify(row.stepsToStart)
        ].join(',');
      })
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'job_predictions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-full mx-auto mt-8 animate-fade-in-up px-2 md:px-0">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-cyan-400"/>
            Prediction Analysis
        </h2>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-emerald-500/20"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar pb-2">
          <table className="w-full text-left border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-slate-900/50 text-slate-300 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-slate-700 w-[150px]">Role Context</th>
                <th className="p-4 font-semibold border-b border-slate-700 w-[200px]">Description</th>
                <th className="p-4 font-semibold border-b border-slate-700 w-[120px]">
                    <div className="flex items-center gap-1">
                        Replacement
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                    </div>
                </th>
                <th className="p-4 font-semibold border-b border-slate-700 w-[180px]">Replaced By</th>
                <th className="p-4 font-semibold border-b border-slate-700 w-[200px]">Transferable Skills</th>
                <th className="p-4 font-semibold border-b border-slate-700 w-[150px]">
                    <div className="flex items-center gap-1 text-cyan-400">
                        Aim For
                        <ArrowRight className="w-3 h-3" />
                    </div>
                </th>
                <th className="p-4 font-semibold border-b border-slate-700 w-[250px]">
                     <div className="flex items-center gap-1 text-emerald-400">
                        Steps to Start
                        <ListTodo className="w-3 h-3" />
                    </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {data.map((row, index) => (
                <tr key={index} className="hover:bg-slate-700/30 transition-colors">
                  <td className="p-4 align-top">
                    <div className="font-medium text-white">{row.role}</div>
                    <div className="text-xs text-slate-400 mt-1">{row.industry}</div>
                    <div className="text-xs text-slate-500">{row.country}</div>
                  </td>
                  <td className="p-4 align-top text-sm text-slate-300">
                    {row.jobDescription}
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-mono text-amber-300">{row.predictionDate}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 w-fit">
                            Conf: {row.confidence}
                        </span>
                    </div>
                  </td>
                  <td className="p-4 align-top text-sm text-slate-300">
                    {row.replacementTechnology}
                  </td>
                  <td className="p-4 align-top text-sm text-slate-300">
                    <div className="flex flex-wrap gap-1">
                        {row.transferableSkills.split(',').map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300 border border-slate-600">
                                {skill.trim()}
                            </span>
                        ))}
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <span className="text-sm font-semibold text-cyan-400 block">
                        {row.futureJob}
                    </span>
                  </td>
                  <td className="p-4 align-top text-sm text-slate-300">
                    <p className="whitespace-pre-line leading-relaxed">
                        {row.stepsToStart}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4 text-center text-xs text-slate-500">
        Predictions are generated by AI and are speculative estimates for educational purposes.
      </div>
    </div>
  );
};