import { PredictionData } from '../types';

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const SPREADSHEET_TITLE = 'FutureWork AI Data';
const STORAGE_KEY_SPREADSHEET_ID = 'futurework_spreadsheet_id';

declare global {
  interface Window {
    google: any;
  }
}

export interface SheetConfig {
  clientId: string;
}

export interface SheetSearchResult {
  data: PredictionData;
  rowIndex: number;
  isStale: boolean;
}

let tokenClient: any;
let accessToken: string | null = null;

export const initGoogleAuth = (clientId: string, onTokenReceived: () => void) => {
  if (!window.google) return;
  
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: (tokenResponse: any) => {
      if (tokenResponse && tokenResponse.access_token) {
        accessToken = tokenResponse.access_token;
        onTokenReceived();
      }
    },
  });
};

export const requestAccessToken = () => {
  if (tokenClient) {
    tokenClient.requestAccessToken();
  } else {
    console.error("Token client not initialized");
  }
};

export const isAuthorized = () => !!accessToken;

async function createSpreadsheet(): Promise<string> {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: { title: SPREADSHEET_TITLE },
      sheets: [{
        properties: {
            title: "Predictions",
            gridProperties: { frozenRowCount: 1 }
        }
      }]
    })
  });

  if (!response.ok) throw new Error('Failed to create spreadsheet');
  const data = await response.json();
  
  // Add headers including Last Updated
  const headers = [
    "Industry", "Country", "Role", "Description", "Prediction Date", 
    "Confidence", "Replacement Tech", "Transferable Skills", "Future Job", "Steps to Start", "Last Updated"
  ];
  
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${data.spreadsheetId}/values/Predictions!A1:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [headers]
    })
  });

  localStorage.setItem(STORAGE_KEY_SPREADSHEET_ID, data.spreadsheetId);
  return data.spreadsheetId;
}

export const getSpreadsheetId = (): string | null => {
  return localStorage.getItem(STORAGE_KEY_SPREADSHEET_ID);
};

// Helper to format row data
const formatRowData = (item: PredictionData) => {
  const today = new Date().toISOString().split('T')[0];
  return [
    item.industry,
    item.country,
    item.role,
    item.jobDescription,
    item.predictionDate,
    item.confidence,
    item.replacementTechnology,
    item.transferableSkills,
    item.futureJob,
    item.stepsToStart,
    today // Column 10 (Index K)
  ];
};

export const checkAndSaveToSheet = async (data: PredictionData[]) => {
  if (!accessToken) return;

  let spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) {
    spreadsheetId = await createSpreadsheet();
  }

  const rows = data.map(formatRowData);

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Predictions!A1:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values: rows })
  });
};

export const updateSheetRow = async (rowIndex: number, data: PredictionData) => {
  if (!accessToken) return;
  const spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return;

  const rowData = formatRowData(data);
  // Sheet rows are 1-based, passed rowIndex should be the actual sheet row number
  
  const range = `Predictions!A${rowIndex}:K${rowIndex}`;

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values: [rowData] })
  });
};

export const searchInSheet = async (industry: string, country: string, role: string): Promise<SheetSearchResult | null> => {
  if (!accessToken) return null;
  
  let spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) return null;

  try {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Predictions!A:K`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!response.ok) {
        if (response.status === 404 || response.status === 403) {
            localStorage.removeItem(STORAGE_KEY_SPREADSHEET_ID);
            return null;
        }
        return null;
    }

    const result = await response.json();
    const rows = result.values;
    
    if (!rows || rows.length < 2) return null;

    const norm = (str: string) => str?.toLowerCase().trim();
    
    // Find index. Note: rows[0] is header, so data starts at index 1.
    // Sheet Row Number = index + 1
    const matchIndex = rows.findIndex((r: string[]) => 
      norm(r[0]) === norm(industry) &&
      norm(r[1]) === norm(country) &&
      norm(r[2]) === norm(role)
    );

    if (matchIndex !== -1) {
      const matchedRow = rows[matchIndex];
      const sheetRowNumber = matchIndex + 1;

      // Check Stale Date (Column 10 / Index K)
      let isStale = false;
      const lastUpdatedStr = matchedRow[10];
      
      if (lastUpdatedStr) {
        const lastUpdatedDate = new Date(lastUpdatedStr);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        if (lastUpdatedDate < oneMonthAgo) {
          isStale = true;
        }
      } else {
        // If no date exists, treat as stale/legacy
        isStale = true;
      }

      return {
        data: {
          industry: matchedRow[0],
          country: matchedRow[1],
          role: matchedRow[2],
          jobDescription: matchedRow[3],
          predictionDate: matchedRow[4],
          confidence: matchedRow[5],
          replacementTechnology: matchedRow[6],
          transferableSkills: matchedRow[7],
          futureJob: matchedRow[8],
          stepsToStart: matchedRow[9] || ''
        },
        rowIndex: sheetRowNumber,
        isStale
      };
    }
  } catch (e) {
    console.error("Error searching sheet", e);
  }
  return null;
};
