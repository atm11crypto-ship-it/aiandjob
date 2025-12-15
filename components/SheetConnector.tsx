import React, { useState, useEffect } from 'react';
import { Database, Check, Settings, X } from 'lucide-react';
import { initGoogleAuth, requestAccessToken, isAuthorized } from '../services/sheetService';

interface SheetConnectorProps {
  onConnected: () => void;
}

export const SheetConnector: React.FC<SheetConnectorProps> = ({ onConnected }) => {
  const [connected, setConnected] = useState(false);
  const [clientId, setClientId] = useState(() => localStorage.getItem('google_client_id') || '');
  const [showConfig, setShowConfig] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (clientId) {
      try {
        initGoogleAuth(clientId, () => {
          setConnected(true);
          onConnected();
          setIsInitializing(false);
        });
      } catch (e) {
        console.error("Failed to init google auth", e);
      }
    }
  }, [clientId, onConnected]);

  const handleConnect = () => {
    if (!clientId) {
      setShowConfig(true);
      return;
    }
    setIsInitializing(true);
    requestAccessToken();
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientId) {
      localStorage.setItem('google_client_id', clientId);
      setShowConfig(false);
      // Re-init happens via effect
      window.location.reload(); // Reload to ensure clean init of Google script
    }
  };

  if (connected) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/30 border border-emerald-800 rounded-full text-emerald-400 text-sm">
        <Check className="w-4 h-4" />
        <span>Sheets Synced</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleConnect}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-sm transition-colors"
      >
        <Database className="w-4 h-4" />
        <span>{isInitializing ? 'Connecting...' : 'Connect Sheets'}</span>
      </button>

      {showConfig && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" />
                Configure Google Sheets
              </h3>
              <button onClick={() => setShowConfig(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-slate-400 mb-4">
              To save and cache predictions, enter a Google Cloud Client ID. 
              <br/>
              <span className="text-xs opacity-70">Note: This is stored locally in your browser.</span>
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Client ID</label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="e.g. 123456-abcdef.apps.googleusercontent.com"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 text-white text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
              >
                Save & Connect
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
